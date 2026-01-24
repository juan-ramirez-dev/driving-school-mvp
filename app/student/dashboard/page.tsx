"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, isStudent } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Calendar,
  Clock,
  User,
  DollarSign,
  AlertCircle,
  BookOpen,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStudentAvailableSlots,
  getStudentBookings,
  bookClass,
  cancelBooking,
  getStudentFines,
  getStudentDebt,
} from "@/src/api";
import type {
  AvailableSlot,
  StudentBooking,
  Fine,
  StudentDebt,
} from "@/src/mocks/student";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"slots" | "bookings" | "fines">("slots");

  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [classTypeFilter, setClassTypeFilter] = useState<"theoretical" | "practical" | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all-dates");

  // Bookings state
  const [bookings, setBookings] = useState<StudentBooking[]>([]);

  // Fines and debt state
  const [fines, setFines] = useState<Fine[]>([]);
  const [debt, setDebt] = useState<StudentDebt | null>(null);
  const [canBook, setCanBook] = useState<{ canBook: boolean; reason?: string } | null>(null);

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<StudentBooking | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isStudent()) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load all data in parallel
      // Note: studentId removed - backend uses authenticated user
      const [slotsRes, bookingsRes, finesRes, debtRes] = await Promise.all([
        getStudentAvailableSlots(),
        getStudentBookings(user.id),
        getStudentFines(user.id),
        getStudentDebt(user.id),
      ]);

      console.log('slotsRes', slotsRes);

      if (slotsRes.success) {
        setAvailableSlots(slotsRes.data);
        console.log('availableSlots', slotsRes.data);
      } else {
        toast.error("Error al cargar horarios disponibles");
      }

      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
      } else {
        toast.error("Error al cargar reservas");
      }

      if (finesRes.success) {
        setFines(finesRes.data);
      } else {
        toast.error("Error al cargar multas");
      }

      if (debtRes.success) {
        setDebt(debtRes.data);
      } else {
        toast.error("Error al cargar deuda");
      }

      // Check if student can book
      const { canStudentBook } = await import("@/src/utils/businessRules");
      const bookingValidation = await canStudentBook(user.id);
      setCanBook(bookingValidation);
    } catch (error) {
      toast.error("Error al cargar datos del dashboard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClass = async (slot: AvailableSlot) => {
    if (!user) return;

    try {
      // Transform slot data to backend booking structure
      const class_type_id = slot.classType === "theoretical" ? 1 : 2;
      
      const response = await bookClass({
        teacher_id: parseInt(slot.teacherId),
        class_type_id: class_type_id,
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
        // resource_id will be fetched automatically by the API function
      });

      if (response.success) {
        toast.success("¡Clase reservada exitosamente!");
        // Reload data
        await loadDashboardData();
      } else {
        toast.error(response.message || "Error al reservar clase");
      }
    } catch (error) {
      toast.error("Error al reservar clase");
      console.error(error);
    }
  };

  const handleCancelClick = (booking: StudentBooking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!user || !bookingToCancel) return;

    try {
      // Transform to backend format: bookingId -> appointment_id
      const response = await cancelBooking({
        appointment_id: parseInt(bookingToCancel.id),
        student_id: parseInt(user.id),
        reason: "", // Optional, can be added later if needed
      });

      if (response.success) {
        // Check if penalty was applied
        if (response.data?.penalty_applied) {
          toast.warning(
            `Reserva cancelada. Se aplicó una multa de $${response.data.penalty?.amount?.toLocaleString("es-CO") || "N/A"} por cancelación tardía.`,
            { duration: 6000 }
          );
        } else {
          toast.success("Reserva cancelada exitosamente");
        }
        setCancelDialogOpen(false);
        setBookingToCancel(null);
        // Reload data
        await loadDashboardData();
      } else {
        toast.error(response.message || "Error al cancelar reserva");
      }
    } catch (error) {
      toast.error("Error al cancelar reserva");
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.info("Sesión cerrada exitosamente");
  };


  console.log('availableSlots', availableSlots);

  // Filter available slots
  const filteredSlots = availableSlots.filter((slot) => {
    if (classTypeFilter !== "all" && slot.classType !== classTypeFilter) {
      return false;
    }
    if (dateFilter !== "all-dates" && slot.date !== dateFilter) {
      return false;
    }
    return true;
  });

  console.log('filteredSlots', filteredSlots);

  // Get unique dates for filter
  const uniqueDates = Array.from(new Set(availableSlots.map((s) => s.date))).sort();

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: StudentBooking["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Programada</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completada</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="SANTALIBRADA Logo"
              className="h-16 sm:h-20 w-auto hidden sm:block"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Panel del Estudiante</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Gestiona tus clases, multas y pagos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <User className="h-4 w-4" />
              <span className="truncate max-w-[100px] sm:max-w-none">{user.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </Button>
          </div>
        </div>

        {/* Debt Summary Card */}
        {debt?.totalDebt && debt?.totalDebt > 0 ? (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                Resumen de Deuda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Deuda Total:</span>
                  <span className="text-2xl font-bold text-red-600">
                    ${debt.totalDebt.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Multas Pendientes:</span>
                  <span className="font-semibold">
                    ${debt.outstandingFines.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Pagos Pendientes:</span>
                  <span className="font-semibold">
                    ${debt.pendingPayments.toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "slots" ? "default" : "ghost"}
            onClick={() => setActiveTab("slots")}
            className="rounded-b-none"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Horarios Disponibles
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "ghost"}
            onClick={() => setActiveTab("bookings")}
            className="rounded-b-none"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Mis Clases ({bookings.filter((b) => b.status === "scheduled").length})
          </Button>
          <Button
            variant={activeTab === "fines" ? "default" : "ghost"}
            onClick={() => setActiveTab("fines")}
            className="rounded-b-none"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Multas ({fines.filter((f) => !f.isPaid).length})
          </Button>
        </div>

        {/* Available Slots Tab */}
        {activeTab === "slots" && (
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Tipo de Clase</label>
                    <Select
                      value={classTypeFilter}
                      onValueChange={(value) =>
                        setClassTypeFilter(value as "theoretical" | "practical" | "all")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="theoretical">Teórica</SelectItem>
                        <SelectItem value="practical">Práctica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Fecha</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las fechas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-dates">Todas las fechas</SelectItem>
                        {uniqueDates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Slots List */}
            {filteredSlots.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No hay horarios disponibles</p>
                  <p className="text-sm text-muted-foreground">
                    No se encontraron clases disponibles con los filtros seleccionados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSlots.map((slot) => (
                  <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {slot.classType === "theoretical" ? "Clase Teórica" : "Clase Práctica"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(slot.date)}
                          </p>
                        </div>
                        <Badge
                          variant={slot.classType === "theoretical" ? "default" : "secondary"}
                        >
                          {slot.classType === "theoretical" ? "Teórica" : "Práctica"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{slot.teacherName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {slot.availableSpots} de {slot.totalSpots} cupos disponibles
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleBookClass(slot)}
                        disabled={slot.availableSpots === 0 || (canBook !== null && !canBook.canBook)}
                      >
                        {slot.availableSpots === 0 
                          ? "Sin cupos" 
                          : (canBook !== null && !canBook.canBook)
                          ? "No disponible"
                          : "Reservar Clase"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No tienes clases programadas</p>
                  <p className="text-sm text-muted-foreground">
                    Reserva una clase desde la pestaña "Horarios Disponibles".
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {booking.classType === "theoretical"
                                ? "Clase Teórica"
                                : "Clase Práctica"}
                            </h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Instructor: {booking.teacherName}</span>
                            </div>
                            {booking.cancelledAt && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <XCircle className="h-4 w-4" />
                                <span>
                                  Cancelada el{" "}
                                  {new Date(booking.cancelledAt).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {booking.status === "scheduled" && (
                          <Button
                            variant="destructive"
                            onClick={() => handleCancelClick(booking)}
                            className="sm:ml-auto"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fines Tab */}
        {activeTab === "fines" && (
          <div className="space-y-4">
            {fines.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium mb-2">No tienes multas</p>
                  <p className="text-sm text-muted-foreground">
                    ¡Mantén un buen registro y evita las multas!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Multas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fines.map((fine) => (
                        <div
                          key={fine.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg"
                        >
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{fine.reason}</p>
                            <p className="text-sm text-muted-foreground">
                              Fecha: {formatDate(fine.date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold">
                                ${fine.amount.toLocaleString("es-CO")}
                              </p>
                              {fine.isPaid ? (
                                <Badge className="bg-green-500 mt-1">Pagada</Badge>
                              ) : (
                                <Badge variant="destructive" className="mt-1">
                                  Pendiente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Multas Pendientes:</span>
                        <span className="text-2xl font-bold text-red-600">
                          $
                          {fines
                            .filter((f) => !f.isPaid)
                            .reduce((sum, f) => sum + f.amount, 0)
                            .toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Cancel Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cancelar esta clase?</AlertDialogTitle>
              <AlertDialogDescription>
                {bookingToCancel && (
                  <>
                    Estás a punto de cancelar tu clase{" "}
                    {bookingToCancel.classType === "theoretical" ? "teórica" : "práctica"} del{" "}
                    {formatDate(bookingToCancel.date)} a las {bookingToCancel.startTime}. Esta
                    acción no se puede deshacer.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBookingToCancel(null)}>
                No, mantener
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600">
                Sí, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
