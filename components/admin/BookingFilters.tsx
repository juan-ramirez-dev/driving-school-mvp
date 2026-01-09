"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Instructor } from "@/lib/types";
import { User, IdCard, Users, Calendar } from "lucide-react";

interface BookingFiltersProps {
  filters: {
    studentName: string;
    studentLegalId: string;
    instructorId: string;
    date: string;
  };
  onFiltersChange: (filters: {
    studentName: string;
    studentLegalId: string;
    instructorId: string;
    date: string;
  }) => void;
  instructors: Instructor[];
}

export function BookingFilters({
  filters,
  onFiltersChange,
  instructors,
}: BookingFiltersProps) {
  const handleFilterChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Student Name Filter */}
        <div className="space-y-2">
          <Label htmlFor="student-name" className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            Nombre del Estudiante
          </Label>
          <Input
            id="student-name"
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.studentName}
            onChange={(e) => handleFilterChange("studentName", e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Student Legal ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="student-legal-id" className="flex items-center gap-2 text-sm">
            <IdCard className="h-4 w-4" />
            CC /  TARJETA DE IDENTIDAD
          </Label>
          <Input
            id="student-legal-id"
            type="text"
            placeholder="Buscar por CC /  TARJETA DE IDENTIDAD..."
            value={filters.studentLegalId}
            onChange={(e) => handleFilterChange("studentLegalId", e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Instructor Filter */}
        <div className="space-y-2">
          <Label htmlFor="instructor" className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            Instructor
          </Label>
          <Select
            value={filters.instructorId || "all"}
            onValueChange={(value) => handleFilterChange("instructorId", value === "all" ? "" : value)}
          >
            <SelectTrigger id="instructor" className="text-sm">
              <SelectValue placeholder="Todos los instructores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los instructores</SelectItem>
              {instructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Filter */}
      <div className="border-t pt-4">
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="date" className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Fecha
          </Label>
          <Input
            id="date"
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
