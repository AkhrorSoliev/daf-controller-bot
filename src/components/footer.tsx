export default function Footer() {
  return (
    <footer className="h-14 border-t border-border/60 bg-background/95">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center px-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} DaF Controller
      </div>
    </footer>
  )
}
