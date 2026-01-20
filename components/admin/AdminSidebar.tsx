"use client";

import { 
  Users, 
  Calendar, 
  LogOut, 
  Car, 
  School, 
  GraduationCap, 
  UserCog,
  BarChart3,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/vehicles", label: "Vehículos", icon: Car },
    { href: "/admin/classrooms", label: "Aulas", icon: School },
    { href: "/admin/teachers", label: "Instructores", icon: UserCog },
    { href: "/admin/students", label: "Estudiantes", icon: GraduationCap },
    { href: "/admin/bookings", label: "Reservas", icon: Users },
    { href: "/admin/schedules", label: "Horarios", icon: Calendar },
  ];

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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
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
