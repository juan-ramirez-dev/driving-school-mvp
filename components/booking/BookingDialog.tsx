"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { TimeSlot, ClassType, Instructor } from "@/lib/types";
import { Calendar, Clock, User, BookOpen } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: TimeSlot | null;
  instructor: Instructor | null;
  instructors: Instructor[];
  onConfirm: (
    slot: TimeSlot,
    instructor: Instructor,
    classType: ClassType
  ) => Promise<void>;
}

export function BookingDialog({
  open,
  onOpenChange,
  slot,
  instructor: initialInstructor,
  instructors,
  onConfirm,
}: BookingDialogProps) {
  const [selectedInstructor, setSelectedInstructor] = useState<string>(
    initialInstructor?.id || ""
  );
  const [selectedClassType, setSelectedClassType] = useState<ClassType>("theoretical");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!slot) return null;

  const handleConfirm = async () => {
    if (!selectedInstructor) return;

    const instructor = instructors.find((i) => i.id === selectedInstructor);
    if (!instructor) return;

    setIsSubmitting(true);
    try {
      await onConfirm(slot, instructor, selectedClassType);
      onOpenChange(false);
      // Reset form
      setSelectedInstructor(initialInstructor?.id || "");
      setSelectedClassType("theoretical");
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setIsSubmitting(false);
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reservar una Clase de Manejo</DialogTitle>
          <DialogDescription>
            Confirma los detalles de tu reserva a continuación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date and Time Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Fecha:</span>
              <span>{formatDate(slot.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Hora:</span>
              <span>
                {slot.startTime} - {slot.endTime}
              </span>
            </div>
          </div>

          {/* Class Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="class-type" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tipo de Clase
            </Label>
            <Select
              value={selectedClassType}
              onValueChange={(value) => setSelectedClassType(value as ClassType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="class-type">
                <SelectValue placeholder="Selecciona el tipo de clase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theoretical">Clase Teórica</SelectItem>
                <SelectItem value="practical">Clase Práctica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instructor Selection */}
          <div className="space-y-2">
            <Label htmlFor="instructor" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Instructor
            </Label>
            <Select
              value={selectedInstructor}
              onValueChange={setSelectedInstructor}
              disabled={isSubmitting}
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedInstructor || isSubmitting}
          >
            {isSubmitting ? "Reservando..." : "Confirmar Reserva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
