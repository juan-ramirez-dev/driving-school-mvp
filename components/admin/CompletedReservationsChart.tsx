"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCompletedReservations, getTeachers } from "@/src/api";
import { toast } from "sonner";
import type { Teacher, Reservation } from "@/src/mocks/types";
import { Calendar } from "lucide-react";

interface ChartData {
  teacherName: string;
  reservations: number;
}

export function CompletedReservationsChart() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
    // Set default date range to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  }, []);

  const loadTeachers = async () => {
    try {
      const result = await getTeachers();
      if (result.success) {
        setTeachers(result.data);
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
    }
  };

  const loadChartData = async () => {
    try {
      setIsLoading(true);
      
      // Get all completed reservations
      const result = await getCompletedReservations(
        selectedTeacherId === "all" ? undefined : selectedTeacherId
      );

      if (!result.success) {
        toast.error(result.message || "Error al cargar datos");
        return;
      }

      const reservations = result.data.reservations;

      // Filter by date range if provided
      let filteredReservations = reservations;
      if (startDate && endDate) {
        filteredReservations = reservations.filter((reservation) => {
          const completedDate = reservation.completedAt
            ? new Date(reservation.completedAt).toISOString().split("T")[0]
            : reservation.date;
          return completedDate >= startDate && completedDate <= endDate;
        });
      }

      // Group by teacher
      const teacherMap = new Map<string, number>();

      filteredReservations.forEach((reservation) => {
        const count = teacherMap.get(reservation.teacherId) || 0;
        teacherMap.set(reservation.teacherId, count + 1);
      });

      // Get teachers list if not already loaded
      let teachersList = teachers;
      if (teachersList.length === 0) {
        const teachersResult = await getTeachers();
        if (teachersResult.success) {
          teachersList = teachersResult.data;
          setTeachers(teachersList);
        }
      }

      // Convert to chart data format
      const data: ChartData[] = Array.from(teacherMap.entries()).map(
        ([teacherId, count]) => {
          const teacher = teachersList.find((t) => t.id === teacherId);
          return {
            teacherName: teacher?.name || `Instructor ${teacherId}`,
            reservations: count,
          };
        }
      );

      // Sort by reservations count (descending)
      data.sort((a, b) => b.reservations - a.reservations);

      setChartData(data);
    } catch (error) {
      toast.error("Error al cargar datos del gráfico");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    if (!startDate || !endDate) {
      toast.error("Por favor seleccione un rango de fechas");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    loadChartData();
  };

  const handleResetFilters = () => {
    setSelectedTeacherId("all");
    setStartDate("");
    setEndDate("");
    setChartData([]);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Reservas Completadas por Instructor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="teacher">Instructor</Label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Todos los instructores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los instructores</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha Inicio</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha Fin</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Button onClick={handleApplyFilters} className="w-full">
              Aplicar Filtros
            </Button>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="w-full  mt-4"
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">
              No hay datos para mostrar. Seleccione un rango de fechas y haga clic en "Aplicar Filtros".
            </p>
          </div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="teacherName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="reservations"
                  fill="hsl(var(--primary))"
                  name="Reservas Completadas"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary */}
        {chartData.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total de reservas completadas:{" "}
              <span className="font-semibold text-foreground">
                {chartData.reduce((sum, item) => sum + item.reservations, 0)}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
