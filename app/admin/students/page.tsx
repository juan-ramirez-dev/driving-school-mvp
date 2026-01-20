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
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/src/api";
import type { Student } from "@/src/mocks/types";
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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    legalId: "",
    dateOfBirth: "",
    address: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const result = await getStudents();
      if (result.success) {
        setStudents(result.data);
      } else {
        toast.error(result.message || "Error al cargar estudiantes");
      }
    } catch (error) {
      toast.error("Error al cargar estudiantes");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveStudentCount = () => {
    return students.filter((s) => s.isActive).length;
  };

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        legalId: student.legalId,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        legalId: "",
        dateOfBirth: "",
        address: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      legalId: "",
      dateOfBirth: "",
      address: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        const result = await updateStudent(editingStudent.id, formData);
        if (result.success) {
          toast.success("Estudiante actualizado exitosamente");
          loadStudents();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al actualizar estudiante");
        }
      } else {
        // Check if we're at the limit before creating
        const activeCount = getActiveStudentCount();
        if (activeCount >= 1000) {
          toast.error("Se ha alcanzado el límite máximo de 1000 estudiantes activos");
          return;
        }

        const result = await createStudent(formData);
        if (result.success) {
          toast.success("Estudiante creado exitosamente");
          loadStudents();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al crear estudiante");
        }
      }
    } catch (error) {
      toast.error("Error al guardar estudiante");
      console.error(error);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      const result = await deleteStudent(studentToDelete.id);
      if (result.success) {
        toast.success("Estudiante inactivado exitosamente");
        loadStudents();
        setIsDeleteDialogOpen(false);
        setStudentToDelete(null);
      } else {
        toast.error(result.message || "Error al inactivar estudiante");
      }
    } catch (error) {
      toast.error("Error al inactivar estudiante");
      console.error(error);
    }
  };

  const activeCount = getActiveStudentCount();
  const isAtLimit = activeCount >= 1000;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando estudiantes...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Estudiantes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Estudiantes activos: {activeCount} / 1000
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} disabled={isAtLimit && !editingStudent}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Estudiante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
              </DialogTitle>
            </DialogHeader>
            {isAtLimit && !editingStudent && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">
                  Se ha alcanzado el límite máximo de 1000 estudiantes activos.
                </p>
              </div>
            )}
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
                <Label htmlFor="legalId">Identificación</Label>
                <Input
                  id="legalId"
                  value={formData.legalId}
                  onChange={(e) =>
                    setFormData({ ...formData, legalId: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isAtLimit && !editingStudent}>
                  {editingStudent ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isAtLimit && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Alerta: Se ha alcanzado el límite máximo de 1000 estudiantes activos.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Fecha Nacimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay estudiantes registrados
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{student.legalId}</TableCell>
                    <TableCell>
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          student.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(student)}
                          disabled={!student.isActive}
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
              ¿Está seguro de que desea inactivar al estudiante{" "}
              <strong>{studentToDelete?.name}</strong>? Esta acción
              marcará al estudiante como inactivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>
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
