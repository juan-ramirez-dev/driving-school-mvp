"use client";

import { useEffect, useState } from "react";
import { getAllAppointments, getTeachers } from "@/src/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { BookingFilters } from "@/components/admin/BookingFilters";
import { toast } from "sonner";
import type { BookingWithDetails } from "@/lib/mockData";
import type { Appointment } from "@/src/api/appointments";
import type { Teacher } from "@/src/mocks/types";
import { Download } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filters, setFilters] = useState({
    studentName: "",
    studentLegalId: "",
    instructorId: "",
    date: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsRes, teachersRes] = await Promise.all([
        getAllAppointments(),
        getTeachers(),
      ]);

      if (teachersRes.success) {
        setTeachers(teachersRes.data);
      }

      if (appointmentsRes.success) {
        // Transform appointments to BookingWithDetails format
        const transformedBookings: BookingWithDetails[] = appointmentsRes.data.map((apt: Appointment) => ({
          id: String(apt.id),
          studentId: String(apt.student_id),
          studentName: apt.student?.name || `Estudiante ${apt.student_id}`,
          studentLegalId: apt.student?.document || "",
          instructorId: String(apt.teacher_id),
          instructorName: apt.teacher?.name || `Profesor ${apt.teacher_id}`,
          classType: apt.classType?.name?.toLowerCase().includes("teórica") || apt.classType?.name?.toLowerCase().includes("theoretical") ? "theoretical" : "practical",
          date: apt.date,
          startTime: apt.start_time.substring(0, 5),
          endTime: apt.end_time.substring(0, 5),
          status: apt.status === "confirmed" ? "confirmed" : apt.status === "cancelled" ? "cancelled" : "pending",
          createdAt: new Date().toISOString(), // Backend doesn't always provide this
        }));

        const sortedBookings = transformedBookings.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateB.getTime() - dateA.getTime();
        });
        setBookings(sortedBookings);
        setFilteredBookings(sortedBookings);
      } else {
        toast.error(appointmentsRes.message || "Error al cargar reservas");
      }
    } catch (error) {
      toast.error("Error al cargar reservas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.studentName) {
      filtered = filtered.filter((booking) =>
        booking.studentName
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())
      );
    }

    if (filters.studentLegalId) {
      filtered = filtered.filter((booking) =>
        booking.studentLegalId
          .toLowerCase()
          .includes(filters.studentLegalId.toLowerCase())
      );
    }

    if (filters.instructorId) {
      filtered = filtered.filter(
        (booking) => booking.instructorId === filters.instructorId
      );
    }

    if (filters.date) {
      filtered = filtered.filter(
        (booking) => booking.date === filters.date
      );
    }

    setFilteredBookings(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      studentName: "",
      studentLegalId: "",
      instructorId: "",
      date: "",
    });
  };

  const handleExport = () => {
    toast.info("Función de exportación próximamente");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Reservas</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reservas Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resultados Filtrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl">Filtros</CardTitle>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BookingFilters
            filters={filters}
            onFiltersChange={setFilters}
            instructors={teachers.map((t) => ({
              id: t.id,
              name: `${t.name} ${t.last_name || ""}`.trim(),
            }))}
          />
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl">Reservas</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={filteredBookings} />
        </CardContent>
      </Card>
    </div>
  );
}
