import { HardHatIcon } from "@/components/icons";

// Wordmark + hard-hat mark. Colour inherits (white on the navy header).
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <HardHatIcon className="text-xl" />
      Builder-Pro
    </span>
  );
}
