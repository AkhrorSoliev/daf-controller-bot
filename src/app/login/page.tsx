import LoginForm from "@/components/pages/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border/60 bg-background/95 p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kirish</h1>
          <p className="text-sm text-muted-foreground">Email va parolni kiriting.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
