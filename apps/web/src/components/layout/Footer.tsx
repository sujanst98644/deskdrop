export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Deskdrop — a student marketplace project.
      </div>
    </footer>
  );
}
