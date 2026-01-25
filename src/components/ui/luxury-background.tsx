'use client';

/**
 * LuxuryBackground Component
 * --------------------------
 * Sistema de background sofisticado com gradientes mesh, texturas e vignette.
 * Reutilizável em diferentes páginas do site.
 */

export function LuxuryBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Local Grainy texture overlay (Data URI for robustness) */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3dyZubidYWGZiYmJ8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHcHLZ6SAAAABnRSTlMAAAAAAM76f74AAACPSURBVDjL7ZXJEsMgDAOTV9it6mD6/5+u6XG6pqRQUy85BR6Y5BXp5vVwDPlyX5qB6E/S9K60A1EfSfu9GfA6CPmfSdrpZmBrGvS/nSStXUToK6G6EUXU5T3nLNIHeV6EPeI+ihykfRT7EHVV5EPWreid9B9E77L6TvmPoXdZfSfpT1L/kv6V9A9Zf6uD3L6u8wY8qgVf399/rQAAAABJRU5ErkJggg==')]" />

      {/* Soft Mesh Gradients - Silk & Champagne tones (Lowered opacity for readability) */}
      <div className="absolute -top-[10%] -right-[5%] w-[90vw] h-[90vw] max-w-[1200px] rounded-full bg-[#f3e8d2]/25 blur-[130px]" />
      <div className="absolute top-[15%] -left-[10%] w-[80vw] h-[80vw] max-w-[1000px] rounded-full bg-[#e5e7eb]/40 blur-[110px]" />
      <div className="absolute bottom-[20%] right-[0%] w-[70vw] h-[70vw] max-w-[900px] rounded-full bg-[#fce7f3]/20 blur-[140px]" />

      {/* Depth & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(255,255,255,0.4)_100%)]" />
    </div>
  );
}
