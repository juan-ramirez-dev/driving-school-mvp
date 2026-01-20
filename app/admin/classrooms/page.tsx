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
import { Plus, Edit, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from "@/src/api";
import type { Classroom } from "@/src/mocks/types";
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

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 20,
    location: "",
    equipment: [] as string[],
  });
  const [newEquipment, setNewEquipment] = useState("");

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      setIsLoading(true);
      const result = await getClassrooms();
      if (result.success) {
        setClassrooms(result.data);
      } else {
        toast.error(result.message || "Error al cargar aulas");
      }
    } catch (error) {
      toast.error("Error al cargar aulas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (classroom?: Classroom) => {
    if (classroom) {
      setEditingClassroom(classroom);
      setFormData({
        name: classroom.name,
        capacity: classroom.capacity,
        location: classroom.location,
        equipment: classroom.equipment || [],
      });
    } else {
      setEditingClassroom(null);
      setFormData({
        name: "",
        capacity: 20,
        location: "",
        equipment: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClassroom(null);
    setFormData({
      name: "",
      capacity: 20,
      location: "",
      equipment: [],
    });
    setNewEquipment("");
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim() && !formData.equipment.includes(newEquipment.trim())) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, newEquipment.trim()],
      });
      setNewEquipment("");
    }
  };

  const handleRemoveEquipment = (index: number) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClassroom) {
        const result = await updateClassroom(editingClassroom.id, formData);
        if (result.success) {
          toast.success("Aula actualizada exitosamente");
          loadClassrooms();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al actualizar aula");
        }
      } else {
        const result = await createClassroom(formData);
        if (result.success) {
          toast.success("Aula creada exitosamente");
          loadClassrooms();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al crear aula");
        }
      }
    } catch (error) {
      toast.error("Error al guardar aula");
      console.error(error);
    }
  };

  const handleDeleteClick = (classroom: Classroom) => {
    setClassroomToDelete(classroom);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classroomToDelete) return;
    
    try {
      const result = await deleteClassroom(classroomToDelete.id);
      if (result.success) {
        toast.success("Aula inactivada exitosamente");
        loadClassrooms();
        setIsDeleteDialogOpen(false);
        setClassroomToDelete(null);
      } else {
        toast.error(result.message || "Error al inactivar aula");
      }
    } catch (error) {
      toast.error("Error al inactivar aula");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando aulas...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Aulas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClassroom ? "Editar Aula" : "Nueva Aula"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="capacity">Capacidad</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Equipamiento</Label>
                <div className="flex gap-2">
                  <Input
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEquipment();
                      }
                    }}
                    placeholder="Agregar equipo..."
                  />
                  <Button type="button" onClick={handleAddEquipment}>
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.equipment.map((item, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipment(index)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClassroom ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Equipamiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay aulas registradas
                  </TableCell>
                </TableRow>
              ) : (
                classrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell>{classroom.capacity}</TableCell>
                    <TableCell>{classroom.location}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {classroom.equipment.slice(0, 2).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-secondary rounded text-xs"
                          >
                            {item}
                          </span>
                        ))}
                        {classroom.equipment.length > 2 && (
                          <span className="px-2 py-0.5 text-xs text-muted-foreground">
                            +{classroom.equipment.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          classroom.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {classroom.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(classroom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(classroom)}
                          disabled={!classroom.isActive}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea inactivar el aula{" "}
              <strong>{classroomToDelete?.name}</strong>? Esta acción
              marcará el aula como inactiva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassroomToDelete(null)}>
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
