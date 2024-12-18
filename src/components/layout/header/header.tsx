import { ModeToggle } from '@/components/theme/mode-toggle/mode-toggle';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border md:px-8">
      <div className="flex w-1/2 justify-start">
        <Link
          href={`/`}
          className="text-xl font-bold text-gray-800 dark:text-gray-200"
        >
          MarketBot
        </Link>
      </div>
      <div className="flex shrink-0">
        <nav className="hidden md:flex">
          <Link
            href={`/about`}
            className="text-gray-800 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-300"
          >
            About
          </Link>
          <Link
            href={`/blog`}
            className="text-gray-800 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-300"
          >
            Blog
          </Link>
        </nav>
      </div>
      <div className="flex w-1/2 justify-end">
        <ModeToggle />
      </div>
    </header>
  );
}
