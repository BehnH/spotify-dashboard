import {toTitleCase} from "@/lib/utils";

export const DividePath = (path: string) => {
  /**
   * Format for path data
   * {
   *   name: string
   *   isLast: boolean
   *   path: string
   * }
   */

  const pathParts = path.split('/').filter(Boolean);
  if (pathParts.length === 0) return [
    {
      name: 'Home',
      isLast: true,
      path: '/'
    }
  ];

  return pathParts.map((part, idx) => {
    return {
      name: toTitleCase(part),
      isLast: idx === pathParts.length - 1,
      path: pathParts.slice(0, idx + 1).join('/')
    }
  });
}

export const sidenavIconClassname = (path: string, page: string) => {
  const base = "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8";

  console.log(path, page);

  return path === page ? `${base} text-foreground` : `${base} text-muted-foreground`;
}