"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTeachers,
  getTeacherSchedules,
  createTeacherSchedule,
  updateTeacherSchedule,
  deleteTeacherSchedule,
  toggleTeacherSchedule,
  getClassTypes,
} from "@/src/api";
import type { Teacher } from "@/src/mocks/types";
import type { TeacherSchedule } from "@/src/api/teacher-schedules";
import type { ClassType } from "@/src/api/classtype";
import { toast } from "sonner";
import { Clock, Calendar, Plus, Edit, Trash2, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function SchedulesPageContent() {
  const searchParams = useSearchParams();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<TeacherSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<TeacherSchedule | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    slot_minutes: "30",
    class_type_id: "",
  });

  useEffect(() => {
    loadTeachers();
    loadClassTypes();
    
    // Check if teacher is provided in query params
    const teacherParam = searchParams?.get("teacher");
    if (teacherParam) {
      setSelectedTeacher(teacherParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedTeacher) {
      loadSchedules();
    } else {
      setSchedules([]);
    }
  }, [selectedTeacher]);

  const loadTeachers = async () => {
    try {
      const teachersRes = await getTeachers();
      if (teachersRes.success) {
        setTeachers(teachersRes.data);
        if (teachersRes.data.length > 0 && !selectedTeacher) {
          setSelectedTeacher(String(teachersRes.data[0].id));
        }
      }
    } catch (error) {
      toast.error("Error al cargar profesores");
      console.error(error);
    }
  };

  const loadClassTypes = async () => {
    try {
      const classTypesRes = await getClassTypes();
      if (classTypesRes.success) {
        setClassTypes(classTypesRes.data);
      }
    } catch (error) {
      toast.error("Error al cargar tipos de clase");
      console.error(error);
    }
  };

  const loadSchedules = async () => {
    if (!selectedTeacher) return;
    
    try {
      setIsLoading(true);
      const result = await getTeacherSchedules(Number(selectedTeacher));
      if (result.success) {
        setSchedules(result.data);
      } else {
        toast.error(result.message || "Error al cargar horarios");
      }
    } catch (error) {
      toast.error("Error al cargar horarios");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (schedule?: TeacherSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        user_id: String(schedule.user_id),
        day_of_week: String(schedule.day_of_week),
        start_time: schedule.start_time.substring(0, 5),
        end_time: schedule.end_time.substring(0, 5),
        slot_minutes: String(schedule.slot_minutes),
        class_type_id: schedule.class_type_id ? String(schedule.class_type_id) : "",
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        user_id: selectedTeacher,
        day_of_week: "",
        start_time: "",
        end_time: "",
        slot_minutes: "30",
        class_type_id: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormData({
      user_id: selectedTeacher,
      day_of_week: "",
      start_time: "",
      end_time: "",
      slot_minutes: "30",
      class_type_id: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: Number(formData.user_id),
        day_of_week: Number(formData.day_of_week),
        start_time: formData.start_time,
        end_time: formData.end_time,
        slot_minutes: Number(formData.slot_minutes),
        class_type_id: Number(formData.class_type_id),
      };

      if (editingSchedule) {
        const result = await updateTeacherSchedule(editingSchedule.id, payload);
        if (result.success) {
          toast.success("Horario actualizado exitosamente");
          loadSchedules();
          handleCloseDialog();
        } else {
          // Handle specific error for overlapping schedules
          if (
            result.message?.includes("cruza") ||
            result.message?.includes("overlap") ||
            result.message?.includes("se cruza") ||
            result.code === 422
          ) {
            toast.error("El horario se cruza con otro existente");
          } else {
            toast.error(result.message || "Error al actualizar horario");
          }
        }
      } else {
        const result = await createTeacherSchedule(payload);
        if (result.success) {
          toast.success("Horario creado exitosamente");
          loadSchedules();
          handleCloseDialog();
        } else {
          // Handle specific error for overlapping schedules
          if (
            result.message?.includes("cruza") ||
            result.message?.includes("overlap") ||
            result.message?.includes("se cruza") ||
            result.code === 422
          ) {
            toast.error("El horario se cruza con otro existente");
          } else {
            toast.error(result.message || "Error al crear horario");
          }
        }
      }
    } catch (error) {
      toast.error("Error al guardar horario");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      const result = await deleteTeacherSchedule(scheduleToDelete.id);
      if (result.success) {
        toast.success("Horario eliminado exitosamente");
        loadSchedules();
        setIsDeleteDialogOpen(false);
        setScheduleToDelete(null);
      } else {
        toast.error(result.message || "Error al eliminar horario");
      }
    } catch (error) {
      toast.error("Error al eliminar horario");
      console.error(error);
    }
  };

  const handleToggle = async (schedule: TeacherSchedule) => {
    try {
      const result = await toggleTeacherSchedule(schedule.id);
      if (result.success) {
        toast.success(
          result.data.active ? "Horario activado" : "Horario desactivado"
        );
        loadSchedules();
      } else {
        toast.error(result.message || "Error al cambiar estado");
      }
    } catch (error) {
      toast.error("Error al cambiar estado");
      console.error(error);
    }
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
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Horario
        </Button>
      </div>

      {/* Teacher Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Profesor</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Seleccionar profesor" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={String(teacher.id)}>
                  {teacher.name} {teacher.last_name || ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando horarios...</p>
        </div>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay horarios configurados</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Horarios del Profesor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 border rounded-lg ${
                    schedule.active
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {DAY_NAMES[schedule.day_of_week]}
                      </span>
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
                    {schedule.class_type_id && (
                      <div className="text-muted-foreground">
                        Tipo: {classTypes.find(ct => ct.id === schedule.class_type_id)?.name || `ID: ${schedule.class_type_id}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(schedule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(schedule)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setScheduleToDelete(schedule);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Editar Horario" : "Nuevo Horario"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="user_id">Profesor *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_id: value })
                }
                required
              >
                <SelectTrigger id="user_id">
                  <SelectValue placeholder="Seleccionar profesor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.name} {teacher.last_name || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="day_of_week">Día de la Semana *</Label>
              <Select
                value={formData.day_of_week}
                onValueChange={(value) =>
                  setFormData({ ...formData, day_of_week: value })
                }
                required
              >
                <SelectTrigger id="day_of_week">
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_NAMES.map((day, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Hora Inicio *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">Hora Fin *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="slot_minutes">Duración del Slot (minutos) *</Label>
              <Select
                value={formData.slot_minutes}
                onValueChange={(value) =>
                  setFormData({ ...formData, slot_minutes: value })
                }
                required
              >
                <SelectTrigger id="slot_minutes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class_type_id">Tipo de Clase *</Label>
              <Select
                value={formData.class_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, class_type_id: value })
                }
                required
              >
                <SelectTrigger id="class_type_id">
                  <SelectValue placeholder="Seleccionar tipo de clase" />
                </SelectTrigger>
                <SelectContent>
                  {classTypes.map((classType) => (
                    <SelectItem key={classType.id} value={String(classType.id)}>
                      {classType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingSchedule ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el horario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScheduleToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SchedulesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      }
    >
      <SchedulesPageContent />
    </Suspense>
  );
}
