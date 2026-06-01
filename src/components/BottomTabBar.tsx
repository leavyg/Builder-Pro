"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlusIcon, MenuIcon } from "@/components/icons";

// App-style bottom navigation: Home · (＋ New, raised) · More.
export default function BottomTabBar() {
  const path = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-end justify-around px-8 py-2">
        <Tab href="/" label="Home" active={path === "/"} icon={<HomeIcon className="text-xl" />} />
        <Link
          href="/new"
          aria-label="New defect"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-lg ring-4 ring-slate-50 transition-colors active:bg-navy-light"
        >
          <PlusIcon className="text-2xl" />
        </Link>
        <Tab href="/more" label="More" active={path === "/more"} icon={<MenuIcon className="text-xl" />} />
      </div>
    </nav>
  );
}

function Tab({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 text-xs font-medium ${
        active ? "text-navy" : "text-slate-400"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
