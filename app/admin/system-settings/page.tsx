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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getSystemSettings,
  createSystemSetting,
  updateSystemSetting,
  deleteSystemSetting,
} from "@/src/api";
import type { SystemSetting } from "@/src/api/system-settings";
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

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<SystemSetting | null>(null);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [formData, setFormData] = useState({
    setting_key: "",
    type: "string" as "string" | "int" | "bool" | "json",
    value: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const result = await getSystemSettings();
      if (result.success) {
        setSettings(result.data);
      } else {
        toast.error(result.message || "Error al cargar configuraciones");
      }
    } catch (error) {
      toast.error("Error al cargar configuraciones");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (setting?: SystemSetting) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData({
        setting_key: setting.setting_key,
        type: setting.type,
        value: String(setting.value),
      });
    } else {
      setEditingSetting(null);
      setFormData({
        setting_key: "",
        type: "string",
        value: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSetting(null);
    setFormData({
      setting_key: "",
      type: "string",
      value: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let valueToSend: string | number | boolean = formData.value;
      
      // Convert value based on type
      if (formData.type === "int") {
        valueToSend = Number(formData.value);
      } else if (formData.type === "bool") {
        valueToSend = formData.value === "true" || formData.value === "1";
      }

      if (editingSetting) {
        const result = await updateSystemSetting(editingSetting.setting_key, {
          type: formData.type,
          value: valueToSend,
        });
        if (result.success) {
          toast.success("Configuración actualizada exitosamente");
          loadSettings();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al actualizar configuración");
        }
      } else {
        const result = await createSystemSetting({
          setting_key: formData.setting_key,
          type: formData.type,
          value: valueToSend,
        });
        if (result.success) {
          toast.success("Configuración creada exitosamente");
          loadSettings();
          handleCloseDialog();
        } else {
          toast.error(result.message || "Error al crear configuración");
        }
      }
    } catch (error) {
      toast.error("Error al guardar configuración");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!settingToDelete) return;

    try {
      const result = await deleteSystemSetting(settingToDelete.setting_key);
      if (result.success) {
        toast.success("Configuración eliminada exitosamente");
        loadSettings();
        setIsDeleteDialogOpen(false);
        setSettingToDelete(null);
      } else {
        toast.error(result.message || "Error al eliminar configuración");
      }
    } catch (error) {
      toast.error("Error al eliminar configuración");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando configuraciones...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuraciones del Sistema</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Configuración
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Configuraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{settings.length}</div>
        </CardContent>
      </Card>

      {/* Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Configuraciones</CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay configuraciones disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.name}</TableCell>
                      <TableCell>{setting.type}</TableCell>
                      <TableCell>{String(setting.value)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(setting)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSettingToDelete(setting);
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
              {editingSetting ? "Editar Configuración" : "Nueva Configuración"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="setting_key">Clave *</Label>
              <Input
                id="setting_key"
                value={formData.setting_key}
                onChange={(e) =>
                  setFormData({ ...formData, setting_key: e.target.value })
                }
                placeholder="Ej: max_appointments_per_day"
                required
                disabled={!!editingSetting}
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
                required
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="int">Integer</SelectItem>
                  <SelectItem value="bool">Boolean</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Valor *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder={
                  formData.type === "bool" ? "true o false" : "Valor"
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingSetting ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar configuración?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la configuración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSettingToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
