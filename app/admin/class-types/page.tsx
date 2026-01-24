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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getClassTypes,
  createClassType,
  updateClassType,
  deleteClassType,
} from "@/src/api";
import type { ClassType } from "@/src/api/classtype";
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

export default function ClassTypesPage() {
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classTypeToDelete, setClassTypeToDelete] = useState<ClassType | null>(null);
  const [editingClassType, setEditingClassType] = useState<ClassType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    requires_resource: false,
  });

  useEffect(() => {
    loadClassTypes();
  }, []);

  const loadClassTypes = async () => {
    try {
      setIsLoading(true);
      const result = await getClassTypes();
      if (result.success) {
        setClassTypes(result.data);
      } else {
        toast.error(result.message || "Error al cargar tipos de clase");
      }
    } catch (error) {
      toast.error("Error al cargar tipos de clase");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (classType?: ClassType) => {
    if (classType) {
      setEditingClassType(classType);
      setFormData({
        name: classType.name,
        requires_resource: classType.requires_resource,
      });
    } else {
      setEditingClassType(null);
      setFormData({
        name: "",
        requires_resource: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClassType(null);
    setFormData({
      name: "",
      requires_resource: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClassType) {
        const result = await updateClassType(editingClassType.id, formData);
        if (result.success) {
          toast.success("Tipo de clase actualizado exitosamente");
          loadClassTypes();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al actualizar tipo de clase");
        }
      } else {
        const result = await createClassType(formData);
        if (result.success) {
          toast.success("Tipo de clase creado exitosamente");
          loadClassTypes();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al crear tipo de clase");
        }
      }
    } catch (error) {
      toast.error("Error al guardar tipo de clase");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!classTypeToDelete) return;

    try {
      const result = await deleteClassType(classTypeToDelete.id);
      if (result.success) {
        toast.success("Tipo de clase eliminado exitosamente");
        loadClassTypes();
        setIsDeleteDialogOpen(false);
        setClassTypeToDelete(null);
      } else {
        // Handle specific error for class type with associated appointments
        if (
          result.message?.includes("citas asociadas") ||
          result.message?.includes("appointments") ||
          result.code === 422
        ) {
          toast.error("No se puede eliminar un tipo de clase con citas asociadas");
        } else {
          toast.error(result.message || "Error al eliminar tipo de clase");
        }
      }
    } catch (error) {
      toast.error("Error al eliminar tipo de clase");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando tipos de clase...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Tipos de Clase</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Tipos de Clase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{classTypes.length}</div>
        </CardContent>
      </Card>

      {/* Class Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tipos de Clase</CardTitle>
        </CardHeader>
        <CardContent>
          {classTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay tipos de clase disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Requiere Recurso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classTypes.map((classType) => (
                    <TableRow key={classType.id}>
                      <TableCell>{classType.id}</TableCell>
                      <TableCell className="font-medium">{classType.name}</TableCell>
                      <TableCell>
                        {classType.requires_resource ? (
                          <span className="text-green-600">Sí</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(classType)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setClassTypeToDelete(classType);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClassType ? "Editar Tipo de Clase" : "Nuevo Tipo de Clase"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Teórica, Práctica, Intensiva"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requires_resource"
                checked={formData.requires_resource}
                onChange={(e) =>
                  setFormData({ ...formData, requires_resource: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label
                htmlFor="requires_resource"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Requiere recurso (aula o vehículo)
              </Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingClassType ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tipo de clase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Si este tipo de clase tiene citas asociadas,
              no se podrá eliminar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassTypeToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
