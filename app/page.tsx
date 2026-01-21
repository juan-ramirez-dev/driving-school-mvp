"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin, isTeacher } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (isAdmin()) {
        router.push("/admin/dashboard");
      } else if (isTeacher()) {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirigiendo...</p>
    </div>
  );
}
