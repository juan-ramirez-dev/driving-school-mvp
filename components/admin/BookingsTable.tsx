"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { BookingWithDetails } from "@/lib/mockData";
import { Calendar, Clock, User, BookOpen } from "lucide-react";

interface BookingsTableProps {
  bookings: BookingWithDetails[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-sm sm:text-base">
          No hay reservas que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Estudiante</TableHead>
            <TableHead className="min-w-[100px]">CC /  TARJETA DE IDENTIDAD</TableHead>
            <TableHead className="min-w-[140px]">Instructor</TableHead>
            <TableHead className="min-w-[100px]">Tipo</TableHead>
            <TableHead className="min-w-[100px]">Fecha</TableHead>
            <TableHead className="min-w-[100px]">Hora</TableHead>
            <TableHead className="min-w-[100px]">Estado</TableHead>
            <TableHead className="min-w-[140px]">Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm">{booking.studentName}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs sm:text-sm font-mono">
                  {booking.studentLegalId}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs sm:text-sm">{booking.instructorName}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    booking.classType === "theoretical" ? "default" : "secondary"
                  }
                  className="text-[10px] sm:text-xs"
                >
                  {booking.classType === "theoretical" ? "Teórica" : "Práctica"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm">{formatDate(booking.date)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={booking.status === "confirmed" ? "default" : "destructive"}
                  className="text-[10px] sm:text-xs"
                >
                  {booking.status === "confirmed" ? "Confirmada" : "Cancelada"}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {formatDateTime(booking.createdAt)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
