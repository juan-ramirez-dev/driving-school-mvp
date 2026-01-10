"use client";

import { Users, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeView: "bookings" | "schedules";
  onViewChange: (view: "bookings" | "schedules") => void;
  onLogout: () => void;
}

export function AdminSidebar({
  activeView,
  onViewChange,
  onLogout,
}: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="p-4 border-b">
        <div className="flex flex-col items-center gap-2">
          <img 
            src="/logo.png" 
            alt="SANTALIBRADA Logo" 
            className="h-16 w-auto"
          />
          <h2 className="text-sm font-semibold text-center">Panel de Administración</h2>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant={activeView === "bookings" ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            activeView === "bookings" && "bg-primary text-primary-foreground"
          )}
          onClick={() => onViewChange("bookings")}
        >
          <Users className="mr-2 h-4 w-4" />
          Reservas de Estudiantes
        </Button>
        <Button
          variant={activeView === "schedules" ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            activeView === "schedules" && "bg-primary text-primary-foreground"
          )}
          onClick={() => onViewChange("schedules")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Horarios de Instructores
        </Button>
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
