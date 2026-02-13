"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, login.trim(), password);
      router.replace("/");
    } catch {
      setError("Login yoki parol noto‘g‘ri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="login">Login</Label>
        <Input
          id="login"
          name="login"
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            className="pr-10"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" type="submit">
        {isSubmitting ? "Tekshirilmoqda..." : "Kirish"}
      </Button>
    </form>
  );
}
