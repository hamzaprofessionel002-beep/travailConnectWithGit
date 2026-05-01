import { Link, useLocation } from "@tanstack/react-router";
import { Home, Heart, User, Briefcase, Building2 } from "lucide-react";
import { useT } from "@/i18n/useT";

const navItems = [
  { to: "/", icon: Home, key: "nav.home" as const },
  { to: "/browse", icon: Briefcase, key: "nav.browse" as const },
  { to: "/entreprises", icon: Building2, key: "nav.companies" as const },
  { to: "/favorites", icon: Heart, key: "nav.favorites" as const },
  { to: "/profile", icon: User, key: "nav.profile" as const },
] as const;

export function BottomNav() {
  const location = useLocation();
  const t = useT();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
