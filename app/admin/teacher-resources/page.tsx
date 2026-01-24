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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getTeacherResources,
  createTeacherResource,
  deleteTeacherResource,
  getTeachers,
  getResources,
} from "@/src/api";
import type { TeacherResource } from "@/src/api/teacher-resources";
import type { Teacher } from "@/src/mocks/types";
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

export default function TeacherResourcesPage() {
  const [teacherResources, setTeacherResources] = useState<TeacherResource[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherResourceToDelete, setTeacherResourceToDelete] = useState<TeacherResource | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    resource_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [teacherResourcesRes, teachersRes, resourcesRes] = await Promise.all([
        getTeacherResources(),
        getTeachers(),
        getResources(),
      ]);

      if (teacherResourcesRes.success) {
        setTeacherResources(teacherResourcesRes.data);
      }
      if (teachersRes.success) {
        setTeachers(teachersRes.data);
      }
      if (resourcesRes.success) {
        setResources(resourcesRes.data);
      }
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      user_id: "",
      resource_id: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      user_id: "",
      resource_id: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createTeacherResource({
        user_id: Number(formData.user_id),
        resource_id: Number(formData.resource_id),
      });
      if (result.success) {
        toast.success("Recurso asignado exitosamente");
        loadData();
        handleCloseDialog();
      } else {
        // Handle specific error for duplicate assignments
        if (
          result.message?.includes("ya está asignado") ||
          result.message?.includes("duplicate") ||
          result.message?.includes("ya asignado") ||
          result.code === 422
        ) {
          toast.error("El recurso ya está asignado a este profesor");
        } else {
          toast.error(result.message || "Error al asignar recurso");
        }
      }
    } catch (error) {
      toast.error("Error al asignar recurso");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!teacherResourceToDelete) return;

    try {
      const result = await deleteTeacherResource(teacherResourceToDelete.id);
      if (result.success) {
        toast.success("Asignación eliminada exitosamente");
        loadData();
        setIsDeleteDialogOpen(false);
        setTeacherResourceToDelete(null);
      } else {
        toast.error(result.message || "Error al eliminar asignación");
      }
    } catch (error) {
      toast.error("Error al eliminar asignación");
      console.error(error);
    }
  };

  const getTeacherName = (userId: number) => {
    const teacher = teachers.find((t) => Number(t.id) === userId);
    return teacher ? `${teacher.name} ${teacher.last_name || ""}`.trim() : `ID: ${userId}`;
  };

  const getResourceName = (resourceId: number) => {
    const resource = resources.find((r) => Number(r.id) === resourceId);
    return resource ? `${resource.name} (${resource.type})` : `ID: ${resourceId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando asignaciones...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Asignación de Recursos a Profesores</h1>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Asignaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{teacherResources.length}</div>
        </CardContent>
      </Card>

      {/* Teacher Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Asignaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {teacherResources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay asignaciones disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherResources.map((tr) => (
                    <TableRow key={tr.id}>
                      <TableCell>{tr.id}</TableCell>
                      <TableCell>{getTeacherName(tr.user_id)}</TableCell>
                      <TableCell>{getResourceName(tr.resource_id)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setTeacherResourceToDelete(tr);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Asignación</DialogTitle>
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
              <Label htmlFor="resource_id">Recurso *</Label>
              <Select
                value={formData.resource_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, resource_id: value })
                }
                required
              >
                <SelectTrigger id="resource_id">
                  <SelectValue placeholder="Seleccionar recurso" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={String(resource.id)}>
                      {resource.name} ({resource.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">Asignar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar asignación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la asignación del recurso al profesor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTeacherResourceToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
