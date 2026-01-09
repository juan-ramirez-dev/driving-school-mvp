"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, isAdmin } from "@/lib/auth";
import { getAllBookingsWithDetails } from "@/lib/mockData";
import { MOCK_INSTRUCTORS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { BookingFilters } from "@/components/admin/BookingFilters";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { InstructorScheduleManager } from "@/components/admin/InstructorScheduleManager";
import { toast } from "sonner";
import type { BookingWithDetails } from "@/lib/mockData";
import { Download } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [activeView, setActiveView] = useState<"bookings" | "schedules">("bookings");
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [filters, setFilters] = useState({
    studentName: "",
    studentLegalId: "",
    instructorId: "",
    date: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication and admin role
    const currentUser = getCurrentUser();
    if (!currentUser || !isAdmin()) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setIsLoading(false);

    // Load bookings
    loadBookings();
  }, [router]);

  useEffect(() => {
    // Apply filters whenever filters or bookings change
    applyFilters();
  }, [filters, bookings]);

  const loadBookings = () => {
    const allBookings = getAllBookingsWithDetails();
    // Sort by date and time (newest first)
    const sortedBookings = allBookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
    setBookings(sortedBookings);
    setFilteredBookings(sortedBookings); // Initialize filtered bookings
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

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.info("Sesión cerrada exitosamente");
  };

  const handleExport = () => {
    // No functionality for MVP - just show a toast
    toast.info("Función de exportación próximamente");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        <AdminSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Panel de Administración</h1>
            <div className="flex gap-2">
              <Button
                variant={activeView === "bookings" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("bookings")}
                className="text-xs"
              >
                Reservas
              </Button>
              <Button
                variant={activeView === "schedules" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("schedules")}
                className="text-xs"
              >
                Horarios
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {activeView === "bookings" ? (
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
              {/* Stats Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">
                      Total Reservas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">{bookings.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">
                      Reservas Confirmadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                      {bookings.filter((b) => b.status === "confirmed").length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">
                      Resultados Filtrados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {filteredBookings.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <CardTitle className="text-lg sm:text-xl">Filtros</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-xs sm:text-sm"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BookingFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    instructors={MOCK_INSTRUCTORS}
                  />
                </CardContent>
              </Card>

              {/* Bookings Table */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <CardTitle className="text-lg sm:text-xl">Reservas</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="text-xs sm:text-sm"
                    >
                      <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Exportar Excel</span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BookingsTable bookings={filteredBookings} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mx-auto max-w-7xl">
              <InstructorScheduleManager instructors={MOCK_INSTRUCTORS} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
