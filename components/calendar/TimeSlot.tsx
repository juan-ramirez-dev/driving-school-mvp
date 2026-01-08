"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TimeSlot as TimeSlotType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  slot: TimeSlotType;
  onClick: (slot: TimeSlotType) => void;
  disabled?: boolean;
}

export function TimeSlot({ slot, onClick, disabled }: TimeSlotProps) {
  const isAvailable = slot.status === "available";
  const isUnavailable = slot.status === "unavailable";
  const isBooked = slot.status === "booked";

  return (
    <Button
      variant={isAvailable ? "default" : "outline"}
      className={cn(
        "h-16 sm:h-20 w-full flex-col items-center justify-center gap-1 p-2 sm:p-3",
        isAvailable &&
          "bg-green-500 hover:bg-green-600 text-white border-green-600",
        isUnavailable &&
          "bg-red-100 hover:bg-red-200 text-red-800 border-red-300 cursor-not-allowed",
        isBooked &&
          "bg-gray-200 hover:bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && isAvailable && onClick(slot)}
      disabled={disabled || !isAvailable}
    >
      <div className="text-xs sm:text-sm font-semibold">
        {slot.startTime} - {slot.endTime}
      </div>
      <Badge
        variant={
          isAvailable
            ? "default"
            : isUnavailable
            ? "destructive"
            : "secondary"
        }
        className={cn(
          "text-[10px] sm:text-xs px-1.5 sm:px-2",
          isAvailable && "bg-green-600 hover:bg-green-700",
          isUnavailable && "bg-red-500 hover:bg-red-600"
        )}
      >
        {isAvailable
          ? "Disponible"
          : isUnavailable
          ? "No disponible"
          : "Reservado"}
      </Badge>
    </Button>
  );
}
