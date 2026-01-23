"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, isAdmin, isTeacher } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [identification, setIdentification] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(username, password, identification);
      toast.success("¡Inicio de sesión exitoso!");
      
      // Redirect based on backend role (mapped to frontend role)
      // Backend roles: "user" -> student, "docente" -> teacher
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "teacher") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 pb-4 sm:pb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="SANTALIBRADA Logo" 
              className="h-24 sm:h-32 w-auto"
            />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Bienvenido</CardTitle>
          <CardDescription className="text-sm sm:text-base text-center">
            Inicia sesión para programar tus clases de manejo
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="identification">Identificación</Label>
              <Input
                id="identification"
                type="text"
                placeholder="Ingresa tu identificación"
                value={identification}
                onChange={(e) => setIdentification(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Demo: Cualquier usuario/contraseña funcionará
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
