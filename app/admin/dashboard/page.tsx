"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Users, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  getActiveStudentsCount,
  getLastMonthReservations,
  getCompletedReservations,
  exportRUNT,
} from "@/src/api";
import { CompletedReservationsChart } from "@/components/admin/CompletedReservationsChart";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeStudents: 0,
    lastMonthReservations: 0,
    completedReservations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [studentsRes, reservationsRes, completedRes] = await Promise.all([
        getActiveStudentsCount(),
        getLastMonthReservations(),
        getCompletedReservations(),
      ]);

      if (studentsRes.success) {
        setStats((prev) => ({
          ...prev,
          activeStudents: studentsRes.data.count,
        }));
      }

      if (reservationsRes.success) {
        setStats((prev) => ({
          ...prev,
          lastMonthReservations: reservationsRes.data.count,
        }));
      }

      if (completedRes.success) {
        setStats((prev) => ({
          ...prev,
          completedReservations: completedRes.data.count,
        }));
      }
    } catch (error) {
      toast.error("Error al cargar datos del dashboard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportRUNT = async () => {
    try {
      const result = await exportRUNT();
      if (result.success) {
        // In a real app, you would download the file
        toast.success("Datos RUNT exportados exitosamente");
        console.log("RUNT Data:", result.data);
      } else {
        toast.error(result.message || "Error al exportar datos RUNT");
      }
    } catch (error) {
      toast.error("Error al exportar datos RUNT");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleExportRUNT} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar RUNT
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estudiantes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de estudiantes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservas del Mes Pasado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.lastMonthReservations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reservas realizadas el mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Reservas Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.completedReservations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de reservas completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completed Reservations Chart */}
      <CompletedReservationsChart />
    </div>
  );
}
