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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherAvailability,
  setTeacherAvailability,
} from "@/src/api";
import type { Teacher, TeacherAvailability, TimeBlockSize } from "@/src/mocks/types";
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

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherForAvailability, setSelectedTeacherForAvailability] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    document: "",
    licenseNumber: "",
  });
  const [availabilityForm, setAvailabilityForm] = useState({
    date: "",
    startTime: "08:00",
    endTime: "17:00",
    blockSize: "1h" as TimeBlockSize,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [teachersRes, availabilityRes] = await Promise.all([
        getTeachers(),
        getTeacherAvailability(),
      ]);

      if (teachersRes.success) {
        setTeachers(teachersRes.data);
      }

      if (availabilityRes.success) {
        setAvailability(availabilityRes.data);
      }
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      // Split name into name and last_name if it contains a space
      const nameParts = teacher.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      setFormData({
        name: firstName,
        last_name: lastName,
        email: teacher?.email,
        phone: teacher?.phone,
        document: "", // Backend will provide document, but we may not have it in frontend type
        licenseNumber: teacher?.licenseNumber,
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        document: "",
        licenseNumber: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      last_name: "",
      email: "",
      phone: "",
      document: "",
      licenseNumber: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        const result = await updateTeacher(editingTeacher?.id, formData);
        if (result.success) {
          toast.success("Instructor actualizado exitosamente");
          loadData();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al actualizar instructor");
        }
      } else {
        const result = await createTeacher(formData);
        if (result.success) {
          toast.success("Instructor creado exitosamente");
          loadData();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al crear instructor");
        }
      }
    } catch (error) {
      toast.error("Error al guardar instructor");
      console.error(error);
    }
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;
    
    try {
      const result = await deleteTeacher(teacherToDelete.id);
      if (result.success) {
        toast.success("Instructor inactivado exitosamente");
        loadData();
        setIsDeleteDialogOpen(false);
        setTeacherToDelete(null);
      } else {
        toast.error(result.message || "Error al inactivar instructor");
      }
    } catch (error) {
      toast.error("Error al inactivar instructor");
      console.error(error);
    }
  };

  const handleOpenAvailabilityDialog = (teacher: Teacher) => {
    setSelectedTeacherForAvailability(teacher);
    setIsAvailabilityDialogOpen(true);
  };

  const handleCloseAvailabilityDialog = () => {
    setIsAvailabilityDialogOpen(false);
    setSelectedTeacherForAvailability(null);
    setAvailabilityForm({
      date: "",
      startTime: "08:00",
      endTime: "17:00",
      blockSize: "1h",
    });
  };

  const handleSubmitAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForAvailability) return;

    try {
      const result = await setTeacherAvailability({
        teacherId: selectedTeacherForAvailability.id,
        ...availabilityForm,
      });
      if (result.success) {
        toast.success("Disponibilidad configurada exitosamente");
        loadData();
        handleCloseAvailabilityDialog();
      } else {
        toast.error(result.message || "Error al configurar disponibilidad");
      }
    } catch (error) {
      toast.error("Error al configurar disponibilidad");
      console.error(error);
    }
  };

  const getTeacherAvailabilityCount = (teacherId: string) => {
    return availability.filter((a) => a.teacherId === teacherId).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando instructores...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Instructores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "Editar Instructor" : "Nuevo Instructor"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">Documento</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) =>
                    setFormData({ ...formData, document: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Número de Licencia</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTeacher ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers && teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No hay instructores registrados
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher?.id}>
                    <TableCell className="font-medium">{teacher?.name || "-"}</TableCell>
                    <TableCell>{teacher?.last_name || "-"}</TableCell>
                    <TableCell>{teacher?.document || "-"}</TableCell>
                    <TableCell>{teacher?.email}</TableCell>
                    <TableCell>{teacher?.phone}</TableCell>
                    <TableCell>{teacher?.licenseNumber}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          teacher?.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {teacher?.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAvailabilityDialog(teacher)}
                          title="Configurar disponibilidad"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(teacher)}
                          disabled={!teacher?.isActive}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Availability Dialog */}
      <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Configurar Disponibilidad - {selectedTeacherForAvailability?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAvailability} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={availabilityForm.date}
                onChange={(e) =>
                  setAvailabilityForm({ ...availabilityForm, date: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora Inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={availabilityForm.startTime}
                  onChange={(e) =>
                    setAvailabilityForm({
                      ...availabilityForm,
                      startTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora Fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={availabilityForm.endTime}
                  onChange={(e) =>
                    setAvailabilityForm({
                      ...availabilityForm,
                      endTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blockSize">Tamaño de Bloque</Label>
              <Select
                value={availabilityForm.blockSize}
                onValueChange={(value) =>
                  setAvailabilityForm({
                    ...availabilityForm,
                    blockSize: value as TimeBlockSize,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min">15 minutos</SelectItem>
                  <SelectItem value="30min">30 minutos</SelectItem>
                  <SelectItem value="1h">1 hora</SelectItem>
                  <SelectItem value="2h">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseAvailabilityDialog}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea inactivar al instructor{" "}
              <strong>{teacherToDelete?.name}</strong>? Esta acción
              marcará al instructor como inactivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTeacherToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Inactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
