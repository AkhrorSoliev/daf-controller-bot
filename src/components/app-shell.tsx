"use client";

import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { auth } from "@/lib/firebase";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  const isLoginRoute = pathname === "/login";
  const redirectingToLogin = authReady && !isAuthenticated && !isLoginRoute;
  const redirectingToHome = authReady && isAuthenticated && isLoginRoute;

  useEffect(() => {
    if (redirectingToLogin) {
      router.replace("/login");
      return;
    }

    if (redirectingToHome) {
      router.replace("/");
    }
  }, [redirectingToHome, redirectingToLogin, router]);

  if (!pathname || !authReady || redirectingToLogin || redirectingToHome) {
    return (
      <main className="min-h-dvh px-6 py-12">
        <p className="text-sm text-muted-foreground">Tekshirilmoqda...</p>
      </main>
    );
  }

  if (isLoginRoute) {
    return <main className="min-h-dvh">{children}</main>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex flex-1 min-h-0">{children}</main>
      <Footer />
    </div>
  );
}
