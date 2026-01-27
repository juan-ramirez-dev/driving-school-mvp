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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Auto-detect type from value
  const detectType = (value: string): "string" | "int" | "bool" | "json" => {
    if (value === "" || value === null || value === undefined) {
      return "string";
    }
    
    // Check for boolean values
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue === "true" || lowerValue === "false" || 
        lowerValue === "sí" || lowerValue === "si" || lowerValue === "no" ||
        lowerValue === "1" || lowerValue === "0") {
      return "bool";
    }
    
    // Check for integer
    if (/^-?\d+$/.test(value.trim())) {
      return "int";
    }
    
    // Check for JSON
    if ((value.trim().startsWith("{") && value.trim().endsWith("}")) ||
        (value.trim().startsWith("[") && value.trim().endsWith("]"))) {
      try {
        JSON.parse(value);
        return "json";
      } catch {
        return "string";
      }
    }
    
    return "string";
  };

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
      // Convert boolean value to "Sí"/"No" for display
      const displayValue = setting.type === "bool" 
        ? (setting.value ? "Sí" : "No")
        : String(setting.value);
      setFormData({
        setting_key: setting.setting_key,
        type: setting.type,
        value: displayValue,
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
      // Auto-detect type if creating new setting
      const detectedType = editingSetting ? formData.type : detectType(formData.value);
      
      let valueToSend: string | number | boolean = formData.value;
      
      // Convert value based on detected type
      if (detectedType === "int") {
        valueToSend = Number(formData.value);
      } else if (detectedType === "bool") {
        // Handle both Spanish and English boolean values
        const lowerValue = formData.value.toLowerCase().trim();
        valueToSend = lowerValue === "sí" || lowerValue === "si" || 
                      lowerValue === "true" || lowerValue === "1";
      } else if (detectedType === "json") {
        try {
          valueToSend = JSON.parse(formData.value);
        } catch {
          toast.error("Valor JSON inválido");
          return;
        }
      }

      if (editingSetting) {
        const result = await updateSystemSetting(editingSetting.setting_key, {
          type: detectedType,
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
          type: detectedType,
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


  const formatValue = (value: string | number | boolean) => {
    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }
    return value;
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
                    <TableHead>Valor</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TooltipProvider>
                    {settings.map((setting) => (
                      <Tooltip key={setting.id}>
                        <TooltipTrigger asChild>
                          <TableRow>
                            <TableCell className="font-medium">{setting.name}</TableCell>
                            <TableCell>{formatValue(setting.value)}</TableCell>
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
                        </TooltipTrigger>
                        {setting.description && (
                          <TooltipContent>
                            <p className="max-w-xs">{setting.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </TooltipProvider>
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
              <Label htmlFor="value">Valor *</Label>
              {(formData.type === "bool" || (!editingSetting && detectType(formData.value) === "bool")) ? (
                <Select
                  value={formData.value}
                  onValueChange={(value) => {
                    setFormData({ ...formData, value, type: "bool" });
                  }}
                  required
                >
                  <SelectTrigger id="value">
                    <SelectValue placeholder="Seleccione un valor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sí">Sí</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const detectedType = editingSetting ? formData.type : detectType(newValue);
                    setFormData({ ...formData, value: newValue, type: detectedType });
                  }}
                  placeholder="Valor (el tipo se detectará automáticamente)"
                  required
                />
              )}
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
