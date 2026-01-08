"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TimeSlot } from "./TimeSlot";
import type { TimeSlot as TimeSlotType, Instructor } from "@/lib/types";
import {
  generateInstructorAvailability,
  getInstructorBookings,
} from "@/lib/mockData";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

interface DailyCalendarProps {
  selectedDate: Date;
  selectedInstructor: Instructor | null;
  onDateChange: (date: Date) => void;
  onSlotClick: (slot: TimeSlotType) => void;
  bookings: any[];
}

export function DailyCalendar({
  selectedDate,
  selectedInstructor,
  onDateChange,
  onSlotClick,
  bookings,
}: DailyCalendarProps) {
  const [slots, setSlots] = useState<TimeSlotType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedInstructor) {
      setSlots([]);
      return;
    }

    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      const dateString = selectedDate.toISOString().split("T")[0];
      const instructorBookings = getInstructorBookings(
        selectedInstructor.id,
        dateString
      );
      const availability = generateInstructorAvailability(
        selectedInstructor.id,
        dateString,
        bookings
      );

      // Mark slots as booked if they exist in bookings
      const updatedSlots = availability.map((slot) => {
        const isBooked = instructorBookings.some(
          (booking) =>
            booking.startTime === slot.startTime &&
            booking.date === slot.date
        );
        return {
          ...slot,
          status: isBooked ? "booked" : slot.status,
        };
      });

      setSlots(updatedSlots);
      setIsLoading(false);
    }, 300);
  }, [selectedDate, selectedInstructor, bookings]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const availableCount = slots.filter((s) => s.status === "available").length;
  const unavailableCount = slots.filter((s) => s.status === "unavailable").length;

  if (!selectedInstructor) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Selecciona un Instructor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Por favor selecciona un instructor para ver los horarios disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <CardTitle className="text-lg sm:text-xl">
            {formatDate(selectedDate)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDay}
              disabled={isLoading}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              disabled={isLoading}
              className="h-8 px-3 sm:h-10 sm:px-4 text-xs sm:text-sm"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              disabled={isLoading}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-2">
          <span>Disponibles: {availableCount}</span>
          <span>No disponibles: {unavailableCount}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Cargando disponibilidad...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No hay horarios disponibles</p>
          </div>
        ) : (
          <>
            {availableCount === 0 && !isLoading && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay horarios disponibles para este instructor en esta
                  fecha. Por favor intenta seleccionar una fecha diferente o otro instructor.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {slots.map((slot) => (
                <TimeSlot
                  key={slot.id}
                  slot={slot}
                  onClick={onSlotClick}
                  disabled={isLoading}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
