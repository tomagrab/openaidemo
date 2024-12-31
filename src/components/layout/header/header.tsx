import { ModeToggle } from '@/components/theme/mode-toggle/mode-toggle';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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
              <Link href="/documents" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Documents
                </NavigationMenuLink>
              </Link>
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
