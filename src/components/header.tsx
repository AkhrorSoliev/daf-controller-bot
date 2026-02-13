"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <header className="h-16 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
        <span className="text-xl font-semibold tracking-tight">
          DaF Controller
        </span>
        <Button variant="outline" type="button" onClick={handleLogout}>
          Chiqish
        </Button>
      </div>
    </header>
  );
}
