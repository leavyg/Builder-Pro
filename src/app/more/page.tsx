import Link from "next/link";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";
import BottomTabBar from "@/components/BottomTabBar";
import { ChevronRightIcon } from "@/components/icons";

function Row({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 font-medium shadow-sm transition-colors active:bg-slate-50"
    >
      {label}
      <ChevronRightIcon className="text-lg text-slate-300" />
    </Link>
  );
}

export default function MorePage() {
  return (
    <main className="min-h-dvh bg-slate-50 pb-24 text-slate-900">
      <header className="bg-navy px-5 py-4 text-white">
        <Logo className="text-lg" />
        <p className="mt-0.5 text-sm text-slate-300">Setup & settings</p>
      </header>

      <section className="space-y-2 px-4 py-5">
        <Row href="/contractors" label="Contractors" />
        <Row href="/terraces" label="Terraces & houses" />
        <LogoutButton />
      </section>

      <BottomTabBar />
    </main>
  );
}
