import { ModeToggle } from '@/components/theme/mode-toggle/mode-toggle';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

export default function Header() {
  return (
    <header className="z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border md:px-8">
      {/* Left side: Logo or Brand */}
      <div className="flex w-1/2 justify-start">
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 dark:text-gray-200"
        >
          OpenAI AI Demo
        </Link>
      </div>

      {/* Center/Navigation */}
      <div className="flex shrink-0">
        <NavigationMenu>
          <NavigationMenuList>
            {/* Home (simple link) */}
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {/* Documents (submenu example) */}
            <NavigationMenuItem>
              {/* Trigger that displays the dropdown content */}
              <NavigationMenuTrigger>Documents</NavigationMenuTrigger>
              {/* Dropdown content */}
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[200px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/documents/work"
                        className="block rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground"
                      >
                        Work Docs
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/documents/personal"
                        className="block rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground"
                      >
                        Personal Docs
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/documents"
                        className="block rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground"
                      >
                        All Documents
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Users (simple link) */}
            <NavigationMenuItem>
              <Link href="/users" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Users
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>

          {/* NavigationMenuIndicator & NavigationMenuViewport:
              They usually live outside the list but inside <NavigationMenu>. */}
          <NavigationMenuIndicator />
          <NavigationMenuViewport />
        </NavigationMenu>
      </div>

      {/* Right side: Theme Toggle, etc. */}
      <div className="flex w-1/2 justify-end">
        <ModeToggle />
      </div>
    </header>
  );
}
