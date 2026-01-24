"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
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
  DialogFooter,
} from "@/components/ui/dialog";
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
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  getTeacherClasses,
  updateAttendance,
  cancelClass,
} from "@/src/api";
import type {
  TheoreticalClass,
  PracticalClass,
  ClassType,
  AttendanceStatus,
  UpdateAttendancePayload,
  UpdateAttendanceResponse,
  CancelClassPayload,
} from "@/src/mocks/attendance";

interface TeacherClassesManagerProps {
  teacherId?: string; // Optional now, backend uses authenticated user
}

export function TeacherClassesManager({ teacherId }: TeacherClassesManagerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [classType, setClassType] = useState<ClassType>("theoretical");
  const [theoreticalClasses, setTheoreticalClasses] = useState<TheoreticalClass[]>([]);
  const [practicalClasses, setPracticalClasses] = useState<PracticalClass[]>([]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  // Attendance modal state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{
    classId: string;
    classType: ClassType;
    studentId: string;
    studentName: string;
  } | null>(null);

  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelData, setCancelData] = useState<{
    classId: string;
    classType: ClassType;
    canCancelWithoutReason: boolean;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (selectedDate) {
      loadClasses();
    }
  }, [selectedDate]);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      // Get current user ID (teacher is the logged-in user)
      const currentUser = getCurrentUser();
      const currentTeacherId = teacherId || currentUser?.id;
      
      if (!currentTeacherId) {
        toast.error("No se pudo identificar al instructor");
        return;
      }
      
      const result = await getTeacherClasses(selectedDate, currentTeacherId);
      if (result.success) {
        setTheoreticalClasses(result.data.theoreticalClasses);
        setPracticalClasses(result.data.practicalClasses);
      } else {
        toast.error(result.message || "Error al cargar clases");
      }
    } catch (error) {
      toast.error("Error al cargar clases");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSlot = (classId: string) => {
    const newExpanded = new Set(expandedSlots);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedSlots(newExpanded);
  };

  const handleAttendanceClick = (
    classId: string,
    classType: ClassType,
    studentId: string,
    studentName: string
  ) => {
    setAttendanceData({ classId, classType, studentId, studentName });
    setIsAttendanceModalOpen(true);
  };

  const handleAttendanceSubmit = async (status: AttendanceStatus) => {
    if (!attendanceData) return;

    try {
      // Transform to backend format: classId -> appointment_id, status -> attended boolean
      const payload: UpdateAttendancePayload = {
        appointment_id: parseInt(attendanceData.classId),
        student_id: parseInt(attendanceData.studentId),
        attended: status === "attended",
      };

      const result = await updateAttendance(payload);
      if (result.success && result.data) {
        // Check if penalty was applied
        // The API returns UpdateAttendanceResponse which includes penalty_applied
        if (result.data.penalty_applied) {
          toast.warning(
            "Asistencia actualizada. Se aplicó una multa por inasistencia.",
            { duration: 6000 }
          );
        } else {
          toast.success("Asistencia actualizada exitosamente");
        }
        setIsAttendanceModalOpen(false);
        setAttendanceData(null);
        loadClasses(); // Reload to get updated data
      } else {
        const errorMessage = "message" in result ? result.message : "Error al actualizar asistencia";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Error al actualizar asistencia");
      console.error(error);
    }
  };

  const handleCancelClick = (
    classId: string,
    classType: ClassType,
    canCancelWithoutReason: boolean
  ) => {
    setCancelData({ classId, classType, canCancelWithoutReason });
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async () => {
    if (!cancelData) return;

    // If teacher needs permission and no reason provided, show error
    if (!cancelData.canCancelWithoutReason && !cancelReason.trim()) {
      toast.error("Debe proporcionar una razón para cancelar la clase");
      return;
    }

    try {
      // Transform to backend format: classId -> appointment_id
      const payload: CancelClassPayload = {
        appointment_id: parseInt(cancelData.classId),
        reason: cancelReason.trim() || undefined,
      };

      const result = await cancelClass(payload);
      if (result.success) {
        toast.success("Clase cancelada exitosamente");
        setIsCancelModalOpen(false);
        setCancelData(null);
        setCancelReason("");
        loadClasses(); // Reload to get updated data
      } else {
        toast.error(result.message || "Error al cancelar clase");
      }
    } catch (error) {
      toast.error("Error al cancelar clase");
      console.error(error);
    }
  };

  const getAttendanceBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "attended":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Asistió
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            No Asistió
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Date and Class Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gestión de Clases y Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={classType === "theoretical" ? "default" : "outline"}
              onClick={() => setClassType("theoretical")}
              className="flex-1"
            >
              Clases Teóricas
            </Button>
            <Button
              variant={classType === "practical" ? "default" : "outline"}
              onClick={() => setClassType("practical")}
              className="flex-1"
            >
              Clases Prácticas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theoretical Classes View */}
      {classType === "theoretical" && (
        <Card>
          <CardHeader>
            <CardTitle>Clases Teóricas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Cargando clases...
              </p>
            ) : theoreticalClasses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay clases teóricas programadas para esta fecha
              </p>
            ) : (
              <div className="space-y-4">
                {theoreticalClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className={`border rounded-lg ${
                      classItem.isCancelled ? "opacity-50 bg-red-50" : ""
                    }`}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            {classItem.startTime} - {classItem.endTime}
                          </h3>
                          {classItem.isCancelled && (
                            <Badge variant="destructive">Cancelada</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {classItem.students.length} estudiante(s) asignado(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!classItem.isCancelled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelClick(
                              classItem.id,
                              "theoretical",
                              classItem.canCancelWithoutReason
                            )}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Cancelar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSlot(classItem.id)}
                        >
                          {expandedSlots.has(classItem.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedSlots.has(classItem.id) && (
                      <div className="border-t p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>ID</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classItem.students.map((student) => (
                              <TableRow key={student.studentId}>
                                <TableCell className="font-medium">
                                  {student.name}
                                </TableCell>
                                <TableCell>{student.legalId}</TableCell>
                                <TableCell>
                                  {getAttendanceBadge(student.attendanceStatus)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {!classItem.isCancelled && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleAttendanceClick(
                                          classItem.id,
                                          "theoretical",
                                          student.studentId,
                                          student.name
                                        )
                                      }
                                    >
                                      Marcar Asistencia
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Practical Classes View */}
      {classType === "practical" && (
        <Card>
          <CardHeader>
            <CardTitle>Clases Prácticas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Cargando clases...
              </p>
            ) : practicalClasses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay clases prácticas programadas para esta fecha
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {practicalClasses.map((classItem) => (
                  <Card
                    key={classItem.id}
                    className={`${
                      classItem.isCancelled ? "opacity-50 bg-red-50" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {classItem.student.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {classItem.startTime} - {classItem.endTime}
                          </p>
                        </div>
                        {classItem.isCancelled && (
                          <Badge variant="destructive">Cancelada</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">ID</p>
                        <p className="font-medium">{classItem.student.legalId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{classItem.student.phone}</p>
                      </div>
                      {classItem.vehicleType && (
                        <div>
                          <p className="text-sm text-muted-foreground">Vehículo</p>
                          <p className="font-medium">{classItem.vehicleType}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Estado de Asistencia
                        </p>
                        {getAttendanceBadge(classItem.attendanceStatus)}
                      </div>
                      <div className="flex gap-2 pt-2">
                        {!classItem.isCancelled && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                handleAttendanceClick(
                                  classItem.id,
                                  "practical",
                                  classItem.student.studentId,
                                  classItem.student.name
                                )
                              }
                            >
                              Marcar Asistencia
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCancelClick(
                                  classItem.id,
                                  "practical",
                                  classItem.canCancelWithoutReason
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance Modal */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Asistencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Estudiante: <strong>{attendanceData?.studentName}</strong>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleAttendanceSubmit("attended")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Asistió
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleAttendanceSubmit("absent")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                No Asistió
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAttendanceModalOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Class Modal */}
      <AlertDialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Clase</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelData?.canCancelWithoutReason
                ? "¿Está seguro de que desea cancelar esta clase?"
                : "Debe proporcionar una razón para cancelar esta clase."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!cancelData?.canCancelWithoutReason && (
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Razón de Cancelación</Label>
              <Input
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ingrese la razón de cancelación..."
                required
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsCancelModalOpen(false);
              setCancelReason("");
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
