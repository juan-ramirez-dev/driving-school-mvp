"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Instructor, TimeSlot } from "@/lib/types";
import {
  getInstructorSchedule,
  saveInstructorSchedule,
  generateTimeSlots,
  getBookings,
} from "@/lib/mockData";
import { Calendar, Clock, Check, X } from "lucide-react";
import { toast } from "sonner";

interface InstructorScheduleManagerProps {
  instructors: Instructor[];
}

export function InstructorScheduleManager({
  instructors,
}: InstructorScheduleManagerProps) {
  const [selectedInstructor, setSelectedInstructor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedInstructor && selectedDate) {
      loadSchedule();
    } else {
      setTimeSlots([]);
    }
  }, [selectedInstructor, selectedDate]);

  const loadSchedule = () => {
    if (!selectedInstructor || !selectedDate) return;

    setIsLoading(true);
    setTimeout(() => {
      // Generate default time slots for the date
      const defaultSlots = generateTimeSlots(selectedDate);
      
      // Get saved schedule for this instructor and date
      const savedSchedule = getInstructorSchedule(selectedInstructor, selectedDate);
      
      // Get bookings to mark slots as booked
      const bookings = getBookings();
      const instructorBookings = bookings.filter(
        (b) =>
          b.instructorId === selectedInstructor &&
          b.date === selectedDate &&
          b.status === "confirmed"
      );

      // Merge saved schedule with default slots
      const slots = defaultSlots.map((slot) => {
        const savedSlot = savedSchedule.find(
          (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
        );
        
        const isBooked = instructorBookings.some(
          (b) => b.startTime === slot.startTime
        );

        return {
          ...slot,
          instructorId: selectedInstructor,
          status: isBooked
            ? "booked"
            : savedSlot
            ? savedSlot.status
            : slot.status,
        };
      });

      setTimeSlots(slots);
      setIsLoading(false);
    }, 300);
  };

  const toggleSlotStatus = (slotId: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);
    if (!slot) return;

    // Don't allow changing booked slots
    if (slot.status === "booked") {
      toast.warning("No se puede modificar un horario que ya tiene una reserva");
      return;
    }

    const updatedSlots = timeSlots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            status: s.status === "available" ? "unavailable" : "available",
          }
        : s
    );

    setTimeSlots(updatedSlots);
  };

  const saveSchedule = () => {
    if (!selectedInstructor || !selectedDate) {
      toast.error("Selecciona un instructor y una fecha");
      return;
    }

    saveInstructorSchedule(selectedInstructor, selectedDate, timeSlots);
    toast.success("Horario guardado exitosamente");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Gestión de Horarios</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Gestiona la disponibilidad de los instructores
        </p>
      </div>

      {/* Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Instructor y Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select
                value={selectedInstructor}
                onValueChange={setSelectedInstructor}
              >
                <SelectTrigger id="instructor">
                  <SelectValue placeholder="Selecciona un instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      {selectedInstructor && selectedDate && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <CardTitle>
                  Horario - {instructors.find((i) => i.id === selectedInstructor)?.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(selectedDate)}
                </p>
              </div>
              <Button onClick={saveSchedule} disabled={isLoading}>
                Guardar Cambios
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay horarios disponibles para esta fecha
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-green-500 rounded"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-300 rounded"></div>
                    <span>No Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-blue-500 rounded"></div>
                    <span>Reservado</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-colors
                        ${
                          slot.status === "booked"
                            ? "bg-blue-50 border-blue-200 cursor-not-allowed"
                            : slot.status === "available"
                            ? "bg-green-50 border-green-200 hover:bg-green-100"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }
                      `}
                      onClick={() => toggleSlotStatus(slot.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {slot.status === "available" && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                        {slot.status === "unavailable" && (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                        {slot.status === "booked" && (
                          <Badge variant="secondary" className="text-xs">
                            Reservado
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
