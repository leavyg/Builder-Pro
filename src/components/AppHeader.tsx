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
    <header className="sticky top-0 z-10 flex items-center gap-2 bg-navy px-4 py-3 text-white">
      <Link
        href={back}
        aria-label="Back"
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors active:bg-white/10"
      >
        <ChevronLeftIcon className="text-xl" />
      </Link>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </header>
  );
}
