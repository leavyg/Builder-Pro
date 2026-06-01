// Renders one or more signed photo URLs. One photo → full width; several → a
// 2-col grid. Each tappable to open full-size. Server component (markup only).
export default function PhotoGrid({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <a href={urls[0]} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[0]} alt="" className="w-full rounded-2xl object-cover" />
      </a>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {urls.map((u, i) => (
        <a key={i} href={u} target="_blank" rel="noreferrer" className="block aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="" className="h-full w-full rounded-xl object-cover" />
        </a>
      ))}
    </div>
  );
}
