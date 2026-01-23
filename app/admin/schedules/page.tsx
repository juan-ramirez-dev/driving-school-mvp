"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeachers } from "@/src/api";
import { apiGet } from "@/src/api/client";
import type { Teacher } from "@/src/mocks/types";
import { toast } from "sonner";
import { Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface TeacherSchedule {
  teacher_id: number;
  teacher_name: string;
  schedules: Array<{
    day_of_week: number;
    day_name: string;
    start_time: string;
    end_time: string;
    slot_minutes: number;
    active: boolean;
  }>;
}

export default function SchedulesPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availability, setAvailability] = useState<TeacherSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [teachersRes, availabilityRes] = await Promise.all([
        getTeachers(),
        apiGet<any[]>("/teachers/availability/all"),
      ]);

      if (teachersRes.success) {
        setTeachers(teachersRes.data);
      }

      if (availabilityRes.success && availabilityRes.data) {
        setAvailability(availabilityRes.data);
      }
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTeacherName = (teacherId: string | number) => {
    const teacher = teachers.find((t) => t.id === String(teacherId));
    return teacher ? `${teacher.name} ${teacher.last_name || ""}`.trim() : `ID: ${teacherId}`;
  };

  const formatTime = (time: string) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  const getSlotLabel = (minutes: number) => {
    if (minutes === 15) return "15 min";
    if (minutes === 30) return "30 min";
    if (minutes === 60) return "1 hora";
    if (minutes === 120) return "2 horas";
    return `${minutes} min`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando horarios...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Horarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Disponibilidad semanal de instructores
          </p>
        </div>
      </div>

      {availability.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay horarios configurados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {availability.map((teacherSchedule) => (
            <Card key={teacherSchedule.teacher_id}>
              <CardHeader>
                <CardTitle>{getTeacherName(teacherSchedule.teacher_id)}</CardTitle>
              </CardHeader>
              <CardContent>
                {teacherSchedule.schedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tiene horarios configurados</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teacherSchedule.schedules.map((schedule, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg ${
                          schedule.active
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{schedule.day_name}</span>
                          </div>
                          {!schedule.active && (
                            <Badge variant="secondary" className="text-xs">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            Duración: {getSlotLabel(schedule.slot_minutes)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
