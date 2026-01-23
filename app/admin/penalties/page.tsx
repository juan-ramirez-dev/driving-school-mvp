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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CheckCircle2, Filter, X } from "lucide-react";
import { toast } from "sonner";
import {
  getPenalties,
  createPenalty,
  markPenaltyAsPaid,
  getStudents,
  getTeachers,
} from "@/src/api";
import type { Penalty } from "@/src/api/penalties";
import type { Student } from "@/src/mocks/types";
import { Badge } from "@/components/ui/badge";

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    user_id: "all",
    paid: "all",
  });
  const [formData, setFormData] = useState({
    user_id: "",
    appointment_id: "",
    amount: "",
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPenalties();
  }, [filters]);

  const loadData = async () => {
    try {
      const [studentsRes] = await Promise.all([getStudents()]);
      if (studentsRes.success) {
        setStudents(studentsRes.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadPenalties = async () => {
    try {
      setIsLoading(true);
      const userId = filters.user_id && filters.user_id !== "all" ? Number(filters.user_id) : undefined;
      const result = await getPenalties(userId);
      if (result.success) {
        let filtered = result.data;
        if (filters.paid === "paid") {
          filtered = filtered.filter((p) => p.paid);
        } else if (filters.paid === "unpaid") {
          filtered = filtered.filter((p) => !p.paid);
        }
        setPenalties(filtered);
      } else {
        toast.error(result.message || "Error al cargar penalizaciones");
      }
    } catch (error) {
      toast.error("Error al cargar penalizaciones");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      user_id: "",
      appointment_id: "",
      amount: "",
      reason: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      user_id: "",
      appointment_id: "",
      amount: "",
      reason: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createPenalty({
        user_id: Number(formData.user_id),
        appointment_id: formData.appointment_id ? Number(formData.appointment_id) : undefined,
        amount: Number(formData.amount),
        reason: formData.reason,
      });
      if (result.success) {
        toast.success("Penalización creada exitosamente");
        loadPenalties();
        handleCloseDialog();
      } else {
        toast.error(result.message || "Error al crear penalización");
      }
    } catch (error) {
      toast.error("Error al crear penalización");
      console.error(error);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const result = await markPenaltyAsPaid(id);
      if (result.success) {
        toast.success("Penalización marcada como pagada");
        loadPenalties();
      } else {
        toast.error(result.message || "Error al marcar como pagada");
      }
    } catch (error) {
      toast.error("Error al marcar como pagada");
      console.error(error);
    }
  };

  const getUserName = (userId: number) => {
    const student = students.find((s) => Number(s.id) === userId);
    return student ? `${student.name} ${student.last_name || ""}`.trim() : `ID: ${userId}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalDebt = penalties.filter((p) => !p.paid).reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = penalties.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0);

  const handleClearFilters = () => {
    setFilters({
      user_id: "all",
      paid: "all",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando penalizaciones...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Penalizaciones</h1>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Penalización
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Penalizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{penalties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deuda Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalDebt)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {penalties.filter((p) => p.paid).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pagado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl">Filtros</CardTitle>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filter-user">Usuario</Label>
              <Select
                value={filters.user_id}
                onValueChange={(value) =>
                  setFilters({ ...filters, user_id: value })
                }
              >
                <SelectTrigger id="filter-user">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name} {student.last_name || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-paid">Estado de Pago</Label>
              <Select
                value={filters.paid}
                onValueChange={(value) =>
                  setFilters({ ...filters, paid: value })
                }
              >
                <SelectTrigger id="filter-paid">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="paid">Pagadas</SelectItem>
                  <SelectItem value="unpaid">No Pagadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Penalties Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Penalizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {penalties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay penalizaciones disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Razón</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Pago</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {penalties.map((penalty) => (
                    <TableRow key={penalty.id}>
                      <TableCell>{penalty.id}</TableCell>
                      <TableCell>{getUserName(penalty.user_id)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(penalty.amount)}
                      </TableCell>
                      <TableCell>{penalty.reason}</TableCell>
                      <TableCell>
                        {penalty.paid ? (
                          <Badge variant="default" className="bg-green-600">
                            Pagada
                          </Badge>
                        ) : (
                          <Badge variant="destructive">No Pagada</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {penalty.paid_at
                          ? new Date(penalty.paid_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {!penalty.paid && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(penalty.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Marcar como Pagada
                          </Button>
                        )}
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
            <DialogTitle>Nueva Penalización</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="user_id">Usuario *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_id: value })
                }
                required
              >
                <SelectTrigger id="user_id">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name} {student.last_name || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appointment_id">ID de Cita (Opcional)</Label>
              <Input
                id="appointment_id"
                type="number"
                value={formData.appointment_id}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_id: e.target.value })
                }
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0"
                required
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="reason">Razón *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Ej: Cancelación tardía"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">Crear</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
