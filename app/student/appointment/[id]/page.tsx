"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAppointmentById } from "@/src/api/wrappers/appointments";
import type { Appointment } from "@/src/api/appointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User as UserIcon,
  BookOpen,
  ArrowLeft,
  MapPin,
  Car,
  Building2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function AppointmentDetailContent() {
  const router = useRouter();
  const params = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Get appointment ID from URL
    const appointmentId = params?.id as string;
    if (!appointmentId) {
      router.push("/student/dashboard");
      return;
    }

    // Fetch appointment data
    const fetchAppointment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAppointmentById(appointmentId);

        if (response.success && response.data) {
          setAppointment(response.data);
        } else {
          setError("No se pudo cargar la información de la cita");
        }
      } catch (err) {
        setError("Error al cargar la información de la cita");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [router, params]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando información de la cita...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p className="text-muted-foreground">
                  {error || "No se pudo cargar la información de la cita"}
                </p>
              </div>
              <Button onClick={() => router.push("/student/dashboard")} className="w-full">
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // Convert "HH:mm:ss" or "HH:mm" to "HH:MM AM/PM"
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: "Programada", variant: "secondary" as const },
      confirmed: { label: "Confirmada", variant: "default" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const },
      completed: { label: "Completada", variant: "outline" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.scheduled;
  };

  const statusInfo = getStatusBadge(appointment.status);
  const teacherName = appointment.teacher
    ? `${appointment.teacher.name || ""} ${appointment.teacher.last_name || ""}`.trim() || "Instructor"
    : "No asignado";
  const classTypeName = appointment.classType?.name || "Clase";
  const isTheoretical = appointment.class_type_id === 1;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <img 
            src="/logo.png" 
            alt="SANTALIBRADA Logo" 
            className="h-20 sm:h-24 w-auto"
          />
        </div>
        
        {/* Success Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3 sm:p-4">
              <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">¡Reserva Confirmada!</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Tu clase ha sido programada exitosamente. Aquí están los detalles.
          </p>
        </div>

        {/* Appointment Details Card */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">Detalles de la Cita</CardTitle>
              <Badge variant={statusInfo.variant} className="text-sm">
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {/* Class Type */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">Tipo de Clase</span>
              </div>
              <Badge
                variant={isTheoretical ? "default" : "secondary"}
                className="text-sm"
              >
                {classTypeName}
              </Badge>
            </div>

            {/* Date */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">Fecha</span>
              </div>
              <span className="text-muted-foreground text-sm sm:text-base sm:text-right">
                {formatDate(appointment.date)}
              </span>
            </div>

            {/* Time */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">Hora</span>
              </div>
              <span className="text-muted-foreground text-sm sm:text-base sm:text-right">
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </span>
            </div>

            {/* Teacher Information */}
            {appointment.teacher && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <span className="font-medium text-sm sm:text-base">Instructor</span>
                </div>
                <div className="space-y-2 pl-6">
                  <div>
                    <span className="text-sm font-medium">Nombre: </span>
                    <span className="text-sm text-muted-foreground">{teacherName}</span>
                  </div>
                  {appointment.teacher.document && (
                    <div>
                      <span className="text-sm font-medium">Documento: </span>
                      <span className="text-sm text-muted-foreground">
                        {appointment.teacher.document}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resource Information */}
            {appointment.resource && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-3">
                  {appointment.resource.type === "vehicle" ? (
                    <Car className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm sm:text-base">
                    {appointment.resource.type === "vehicle" ? "Vehículo" : "Aula"}
                  </span>
                </div>
                <div className="space-y-2 pl-6">
                  <div>
                    <span className="text-sm font-medium">Nombre: </span>
                    <span className="text-sm text-muted-foreground">
                      {appointment.resource.name}
                    </span>
                  </div>
                  {appointment.resource.type === "vehicle" && (
                    <>
                      {appointment.resource.plate && (
                        <div>
                          <span className="text-sm font-medium">Placa: </span>
                          <span className="text-sm text-muted-foreground">
                            {appointment.resource.plate}
                          </span>
                        </div>
                      )}
                      {appointment.resource.brand && (
                        <div>
                          <span className="text-sm font-medium">Marca: </span>
                          <span className="text-sm text-muted-foreground">
                            {appointment.resource.brand}
                          </span>
                        </div>
                      )}
                      {appointment.resource.model && (
                        <div>
                          <span className="text-sm font-medium">Modelo: </span>
                          <span className="text-sm text-muted-foreground">
                            {appointment.resource.model}
                          </span>
                        </div>
                      )}
                      {appointment.resource.year && (
                        <div>
                          <span className="text-sm font-medium">Año: </span>
                          <span className="text-sm text-muted-foreground">
                            {appointment.resource.year}
                          </span>
                        </div>
                      )}
                      {appointment.resource.color && (
                        <div>
                          <span className="text-sm font-medium">Color: </span>
                          <span className="text-sm text-muted-foreground">
                            {appointment.resource.color}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Appointment ID */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Referencia de Cita
                </span>
                <span className="text-sm font-mono text-muted-foreground">
                  #{appointment.id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Llegada</p>
                <p className="text-sm text-muted-foreground">
                  Por favor llega 10 minutos antes de tu clase programada.
                </p>
              </div>
            </div>
            {isTheoretical ? (
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Materiales</p>
                  <p className="text-sm text-muted-foreground">
                    Trae tu documento de identidad y cualquier material necesario para la clase teórica.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Clase Práctica</p>
                  <p className="text-sm text-muted-foreground">
                    Asegúrate de traer tu documento de identidad y estar listo para la práctica de manejo.
                  </p>
                </div>
              </div>
            )}
            {appointment.teacher && (
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Contacto</p>
                  <p className="text-sm text-muted-foreground">
                    Si necesitas cancelar o reprogramar, hazlo con al menos 4 horas de anticipación.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/student/dashboard")}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
          <Button
            onClick={() => router.push("/student/dashboard")}
            className="flex-1"
          >
            Ver Mis Reservas
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <AppointmentDetailContent />
    </Suspense>
  );
}
