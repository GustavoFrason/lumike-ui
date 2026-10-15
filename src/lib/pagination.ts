/**
 * Janela de páginas numeradas em volta da atual (a 1ª e a última são
 * mostradas à parte, com "..." quando ficam fora da janela).
 */
export function getPageWindow(currentPage: number, totalPages: number, maxVisible = 5) {
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let page = start; page <= end; page++) pages.push(page);

  return { start, end, pages };
}
