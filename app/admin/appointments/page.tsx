"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Trash2, Filter, X } from "lucide-react";
import { toast } from "sonner";
import {
  getAppointments,
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getTeachers,
  getStudents,
  getClassTypes,
  getResources,
} from "@/src/api";
import type { Appointment } from "@/src/api/appointments";
import type { Teacher } from "@/src/mocks/types";
import type { Student } from "@/src/mocks/types";
import type { ClassType } from "@/src/api/classtype";
import type { Resource } from "@/src/api/resources";
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
import { Badge } from "@/components/ui/badge";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [appointmentToUpdateStatus, setAppointmentToUpdateStatus] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState({
    teacher_id: "all",
    student_id: "all",
    date: "",
  });
  const [formData, setFormData] = useState({
    teacher_id: "none",
    student_id: "none",
    class_type_id: "",
    resource_id: "none",
    date: "",
    start_time: "",
    end_time: "",
    status: "scheduled" as "scheduled" | "confirmed" | "cancelled" | "completed",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [showAll, filters]);

  const loadData = async () => {
    try {
      const [teachersRes, studentsRes, classTypesRes, resourcesRes] = await Promise.all([
        getTeachers(),
        getStudents(),
        getClassTypes(),
        getResources(),
      ]);

      if (teachersRes.success) setTeachers(teachersRes.data);
      if (studentsRes.success) setStudents(studentsRes.data);
      if (classTypesRes.success) setClassTypes(classTypesRes.data);
      if (resourcesRes.success) setResources(resourcesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const filtersObj: any = {};
      if (filters.teacher_id && filters.teacher_id !== "all") filtersObj.teacher_id = Number(filters.teacher_id);
      if (filters.student_id && filters.student_id !== "all") filtersObj.student_id = Number(filters.student_id);
      if (filters.date) filtersObj.date = filters.date;

      const result = showAll
        ? await getAllAppointments(filtersObj)
        : await getAppointments(filtersObj);

      if (result.success) {
        setAppointments(result.data);
      } else {
        toast.error(result.message || "Error al cargar citas");
      }
    } catch (error) {
      toast.error("Error al cargar citas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        teacher_id: String(appointment.teacher_id),
        student_id: String(appointment.student_id),
        class_type_id: String(appointment.class_type_id),
        resource_id: appointment.resource_id ? String(appointment.resource_id) : "",
        date: appointment.date,
        start_time: appointment.start_time.substring(0, 5),
        end_time: appointment.end_time.substring(0, 5),
        status: appointment.status,
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        teacher_id: "none",
        student_id: "none",
        class_type_id: "",
        resource_id: "none",
        date: "",
        start_time: "",
        end_time: "",
        status: "scheduled",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAppointment(null);
    setFormData({
      teacher_id: "none",
      student_id: "none",
      class_type_id: "",
      resource_id: "none",
      date: "",
      start_time: "",
      end_time: "",
      status: "scheduled",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        class_type_id: Number(formData.class_type_id),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        status: formData.status,
      };

      if (formData.teacher_id && formData.teacher_id !== "none") payload.teacher_id = Number(formData.teacher_id);
      if (formData.student_id && formData.student_id !== "none") payload.student_id = Number(formData.student_id);
      if (formData.resource_id && formData.resource_id !== "none") payload.resource_id = Number(formData.resource_id);

      if (editingAppointment) {
        const result = await updateAppointment(editingAppointment.id, payload);
        if (result.success) {
          toast.success("Cita actualizada exitosamente");
          loadAppointments();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al actualizar cita");
        }
      } else {
        const result = await createAppointment(payload);
        if (result.success) {
          toast.success("Cita creada exitosamente");
          loadAppointments();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al crear cita");
        }
      }
    } catch (error) {
      toast.error("Error al guardar cita");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const result = await deleteAppointment(appointmentToDelete.id);
      if (result.success) {
        toast.success("Cita eliminada exitosamente");
        loadAppointments();
        setIsDeleteDialogOpen(false);
        setAppointmentToDelete(null);
      } else {
        toast.error(result.message || "Error al eliminar cita");
      }
    } catch (error) {
      toast.error("Error al eliminar cita");
      console.error(error);
    }
  };

  const handleUpdateStatus = async (status: "scheduled" | "confirmed" | "cancelled" | "completed") => {
    if (!appointmentToUpdateStatus) return;

    try {
      const result = await updateAppointmentStatus(appointmentToUpdateStatus.id, status);
      if (result.success) {
        toast.success("Estado de la cita actualizado exitosamente");
        loadAppointments();
        setIsStatusDialogOpen(false);
        setAppointmentToUpdateStatus(null);
      } else {
        toast.error(result.message || "Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "outline",
      confirmed: "default",
      cancelled: "destructive",
      completed: "secondary",
    };
    const labels: Record<string, string> = {
      scheduled: "Programada",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
      completed: "Completada",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find((t) => Number(t.id) === teacherId);
    return teacher ? `${teacher.name} ${teacher.last_name || ""}`.trim() : `ID: ${teacherId}`;
  };

  const getStudentName = (studentId: number) => {
    const student = students.find((s) => Number(s.id) === studentId);
    return student ? `${student.name} ${student.last_name || ""}`.trim() : `ID: ${studentId}`;
  };

  const getClassTypeName = (classTypeId: number) => {
    const classType = classTypes.find((ct) => Number(ct.id) === classTypeId);
    return classType ? classType.name : `ID: ${classTypeId}`;
  };

  const getResourceName = (resourceId?: number | null) => {
    if (!resourceId) return "N/A";
    const resource = resources.find((r) => Number(r.id) === resourceId);
    return resource ? resource.name : `ID: ${resourceId}`;
  };

  const handleClearFilters = () => {
    setFilters({
      teacher_id: "all",
      student_id: "all",
      date: "",
    });
  };

  const filteredResources = formData.class_type_id
    ? resources.filter((r) => {
        const classType = classTypes.find((ct) => Number(ct.id) === Number(formData.class_type_id));
        if (!classType) return true;
        if (classType.requires_resource) {
          return r.type === "classroom" || r.type === "vehicle";
        }
        return true;
      })
    : resources;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando citas...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Citas</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {appointments.filter((a) => a.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Programadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {appointments.filter((a) => a.status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {appointments.filter((a) => a.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl">Filtros</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={showAll ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Mostrar Activas" : "Mostrar Todas"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filter-teacher">Profesor</Label>
              <Select
                value={filters.teacher_id}
                onValueChange={(value) =>
                  setFilters({ ...filters, teacher_id: value })
                }
              >
                <SelectTrigger id="filter-teacher">
                  <SelectValue placeholder="Todos los profesores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los profesores</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.name} {teacher.last_name || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-student">Estudiante</Label>
              <Select
                value={filters.student_id}
                onValueChange={(value) =>
                  setFilters({ ...filters, student_id: value })
                }
              >
                <SelectTrigger id="filter-student">
                  <SelectValue placeholder="Todos los estudiantes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estudiantes</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name} {student.last_name || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-date">Fecha</Label>
              <Input
                id="filter-date"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay citas disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.id}</TableCell>
                      <TableCell>{getTeacherName(appointment.teacher_id)}</TableCell>
                      <TableCell>{getStudentName(appointment.student_id)}</TableCell>
                      <TableCell>{getClassTypeName(appointment.class_type_id)}</TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>
                        {appointment.start_time.substring(0, 5)} -{" "}
                        {appointment.end_time.substring(0, 5)}
                      </TableCell>
                      <TableCell>{getResourceName(appointment.resource_id)}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAppointmentToUpdateStatus(appointment);
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            Cambiar Estado
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setAppointmentToDelete(appointment);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Editar Cita" : "Nueva Cita"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teacher_id">Profesor</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacher_id: value })
                  }
                >
                  <SelectTrigger id="teacher_id">
                    <SelectValue placeholder="Seleccionar profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={String(teacher.id)}>
                        {teacher.name} {teacher.last_name || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="student_id">Estudiante</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, student_id: value })
                  }
                >
                  <SelectTrigger id="student_id">
                    <SelectValue placeholder="Seleccionar estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.name} {student.last_name || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="class_type_id">Tipo de Clase *</Label>
              <Select
                value={formData.class_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, class_type_id: value, resource_id: "none" })
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
                      {classType.requires_resource && " (requiere recurso)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.class_type_id && (
              <div>
                <Label htmlFor="resource_id">Recurso</Label>
                <Select
                  value={formData.resource_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, resource_id: value })
                  }
                >
                  <SelectTrigger id="resource_id">
                    <SelectValue placeholder="Seleccionar recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {filteredResources.map((resource) => (
                      <SelectItem key={resource.id} value={String(resource.id)}>
                        {resource.name} ({resource.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
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
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programada</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingAppointment ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la cita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAppointmentToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Update Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar Estado de la Cita</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona el nuevo estado para la cita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {(["scheduled", "confirmed", "cancelled", "completed"] as const).map((status) => (
              <Button
                key={status}
                variant={
                  appointmentToUpdateStatus?.status === status ? "default" : "outline"
                }
                onClick={() => handleUpdateStatus(status)}
              >
                {status === "scheduled" && "Programada"}
                {status === "confirmed" && "Confirmada"}
                {status === "cancelled" && "Cancelada"}
                {status === "completed" && "Completada"}
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAppointmentToUpdateStatus(null)}>
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
