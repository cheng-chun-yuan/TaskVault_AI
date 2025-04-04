export default function AppFooter() {
    return (
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:h-16 md:px-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaskVault AI. All rights reserved.
          </p>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
      </footer>
    )
  }
  