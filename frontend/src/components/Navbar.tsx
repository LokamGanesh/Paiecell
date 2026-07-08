import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import { ProfileDialog } from "@/components/ProfileDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/courses" },
  { label: "Events", path: "/events" },
  { label: "Gallery", path: "/gallery" },
  { label: "About", path: "/about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoPopup, setLogoPopup] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 nav-blur bg-background/80 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo (popup) + Brand name (home link) — separated */}
        <div className="flex items-center gap-2">
          {/* Logo → opens popup with spinning image */}
          <button
            onClick={() => setLogoPopup(true)}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="View PAIE Cell logo"
          >
            <img
              src="/paie-logo.png"
              alt="PAIE Cell"
              className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
            />
          </button>

          {/* Brand name → navigates home */}
          <Link to="/" className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors">
            PAIE Cell
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-2">
                  <User className="h-4 w-4" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" className="ml-2" onClick={() => setLoginOpen(true)}>
              Login
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="px-4 py-3 text-sm font-medium text-foreground">
                  {user.name}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full gap-2"
                  onClick={() => {
                    setProfileOpen(true);
                    setOpen(false);
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full gap-2"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  setLoginOpen(true);
                  setOpen(false);
                }}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </nav>

    {/* Logo popup */}
    {logoPopup && (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={() => setLogoPopup(false)}
        role="dialog"
        aria-modal="true"
        aria-label="PAIE Cell Logo"
      >
        <div
          className="relative flex flex-col items-center gap-6 p-8 bg-card rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setLogoPopup(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Spinning logo */}
          <div
            className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-primary shadow-lg"
            style={{ animation: "spin 4s linear infinite" }}
          >
            <img
              src="/paie-logo.png"
              alt="PAIE Cell Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="font-display font-bold text-xl text-foreground">PAIE Cell</p>
          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            Empowering youth through holistic education, meditation &amp; leadership development.
          </p>
        </div>

        {/* Inline keyframes — Tailwind's animate-spin is 1s, we want a slower 4s continuous spin */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )}
    </>
  );
};

export default Navbar;
