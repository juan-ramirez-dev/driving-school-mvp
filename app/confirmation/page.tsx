"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBookings } from "@/lib/mockData";
import { MOCK_INSTRUCTORS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Booking, User } from "@/lib/types";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User as UserIcon,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    // Get booking ID from URL
    const bookingId = searchParams.get("id");
    if (!bookingId) {
      router.push("/calendar");
      return;
    }

    // Find booking
    const bookings = getBookings();
    const foundBooking = bookings.find((b) => b.id === bookingId);

    if (!foundBooking) {
      router.push("/calendar");
      return;
    }

    setBooking(foundBooking);
    setIsLoading(false);
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!booking || !user) {
    return null;
  }

  const instructor = MOCK_INSTRUCTORS.find((i) => i.id === booking.instructorId);

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
    // Convert "HH:mm" to "HH:MM AM/PM"
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3 sm:p-4">
              <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">¡Reserva Confirmada!</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Tu clase de manejo ha sido programada exitosamente.
          </p>
        </div>

        {/* Booking Details Card */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Detalles de la Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Class Type */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">Tipo de Clase</span>
              </div>
              <Badge
                variant={
                  booking.classType === "theoretical" ? "default" : "secondary"
                }
                className="text-sm"
              >
                {booking.classType === "theoretical"
                  ? "Teórica"
                  : "Práctica"}
              </Badge>
            </div>

            {/* Date */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">Fecha</span>
              </div>
              <span className="text-muted-foreground text-sm sm:text-base sm:text-right">
                {formatDate(booking.date)}
              </span>
            </div>

            {/* Time */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="font-medium text-sm sm:text-base">Hora</span>
              </div>
              <span className="text-muted-foreground text-sm sm:text-base sm:text-right">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
            </div>

            {/* Instructor */}
            {instructor && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <span className="font-medium text-sm sm:text-base">Instructor</span>
                </div>
                <span className="text-muted-foreground text-sm sm:text-base sm:text-right">
                  {instructor.name}
                </span>
              </div>
            )}

            {/* Booking ID */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Referencia de Reserva
                </span>
                <span className="text-sm font-mono text-muted-foreground">
                  {booking.id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/calendar")}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Calendario
          </Button>
          <Button
            onClick={() => router.push("/calendar")}
            className="flex-1"
          >
            Reservar Otra Clase
          </Button>
        </div>

        {/* Info Message */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Recibirás un correo de confirmación pronto. Por favor llega 10
              minutos antes de tu clase programada.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
