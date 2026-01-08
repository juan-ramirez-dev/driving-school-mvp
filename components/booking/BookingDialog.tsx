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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimeSlot, ClassType, Instructor } from "@/lib/types";
import { Calendar, Clock, User, BookOpen, Check } from "lucide-react";

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
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Instructor
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {instructors.map((instructor) => {
                const isSelected = selectedInstructor === instructor.id;
                const initials = instructor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <button
                    key={instructor.id}
                    type="button"
                    onClick={() => !isSubmitting && setSelectedInstructor(instructor.id)}
                    disabled={isSubmitting}
                    className={cn(
                      "relative group cursor-pointer transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      isSubmitting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Card
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 shadow-lg"
                          : "hover:shadow-md"
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex flex-col items-center gap-2">
                          {/* Avatar */}
                          <div
                            className={cn(
                              "relative w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all",
                              isSelected
                                ? "bg-primary scale-110"
                                : "bg-gradient-to-br from-primary/80 to-primary/60 group-hover:from-primary group-hover:to-primary/80"
                            )}
                          >
                            {initials}
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          {/* Name */}
                          <div className="text-center">
                            <p
                              className={cn(
                                "font-semibold text-xs",
                                isSelected && "text-primary"
                              )}
                            >
                              {instructor.name.split(" ")[0]}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {instructor.name.split(" ")[1]}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
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
