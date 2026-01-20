"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, isTeacher } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCompletedReservations,
} from "@/src/api";
import { getTeachers } from "@/src/api";
import type { Reservation, Teacher } from "@/src/mocks/types";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const [completedReservations, setCompletedReservations] = useState<Reservation[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    thisMonth: 0,
    lastMonth: 0,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isTeacher()) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get teacher info
      const teachersRes = await getTeachers();
      if (teachersRes.success) {
        // Find teacher by email or use first active teacher as default
        let foundTeacher = teachersRes.data.find(
          (t) => t.email === user?.email
        );
        
        // If no match found, use first active teacher (for demo purposes)
        if (!foundTeacher) {
          foundTeacher = teachersRes.data.find((t) => t.isActive) || teachersRes.data[0];
        }
        
        if (foundTeacher) {
          setTeacher(foundTeacher);
          
          // Get completed reservations for this teacher
          const reservationsRes = await getCompletedReservations(foundTeacher.id);
          if (reservationsRes.success) {
            const reservations = reservationsRes.data.reservations;
            setCompletedReservations(reservations);
            
            // Calculate stats
            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            
            const thisMonthReservations = reservations.filter((r) => {
              const completedDate = r.completedAt 
                ? new Date(r.completedAt) 
                : new Date(r.date);
              return completedDate >= thisMonth;
            });
            
            const lastMonthReservations = reservations.filter((r) => {
              const completedDate = r.completedAt 
                ? new Date(r.completedAt) 
                : new Date(r.date);
              return completedDate >= lastMonth && completedDate < thisMonth;
            });
            
            setStats({
              totalCompleted: reservations.length,
              thisMonth: thisMonthReservations.length,
              lastMonth: lastMonthReservations.length,
            });
          }
        }
      }
    } catch (error) {
      toast.error("Error al cargar datos del dashboard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.info("Sesión cerrada exitosamente");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="SANTALIBRADA Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold">Panel del Instructor</h1>
              <p className="text-sm text-muted-foreground">
                {teacher?.name || user.name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Total Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCompleted}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Reservas completadas en total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Este Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.thisMonth}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reservas completadas este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Mes Pasado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.lastMonth}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reservas completadas el mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas Completadas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {completedReservations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay reservas completadas aún
              </p>
            ) : (
              <div className="space-y-2">
                {completedReservations.slice(0, 10).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(reservation.date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.startTime} - {reservation.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Completada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
