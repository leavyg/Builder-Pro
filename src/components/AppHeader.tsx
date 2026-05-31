import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";

export default function AppHeader({
  title,
  back = "/",
}: {
  title: string;
  back?: string;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
      <Link
        href={back}
        aria-label="Back"
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100"
      >
        <ChevronLeftIcon className="text-xl" />
      </Link>
      <h1 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
    </header>
  );
}
