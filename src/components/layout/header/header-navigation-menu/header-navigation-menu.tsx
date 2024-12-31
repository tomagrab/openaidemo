import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import React from 'react';
import { cn } from '@/lib/utils';

export default function HeaderNavigationMenu() {
  return (
    <NavigationMenu className="relative z-50">
      {' '}
      {/* so it floats above content */}
      <NavigationMenuList>
        {/* Home (simple link) */}
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* Documents */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Documents</NavigationMenuTrigger>
          <NavigationMenuContent
            className={cn(
              'navigation-menu-content', // apply advanced animation classes
              'p-4',
            )}
          >
            <ul className="grid gap-3 md:w-[200px] lg:w-[250px]">
              <ListItem href="/documents" title="All Documents">
                All documents in the system.
              </ListItem>
              <ListItem
                href="/documents/upload-and-search"
                title="Upload and Search"
              >
                Upload and search documents.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Users link */}
        <NavigationMenuItem>
          <Link href="/users" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Users
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator
        className={cn(
          'navigation-menu-indicator',
          'top-full z-[10] flex h-2 items-end justify-center overflow-hidden',
          'data-[state=visible]:animate-in data-[state=hidden]:animate-out transition-[width_transform]',
        )}
      >
        <div className="h-2 w-2 rotate-45 bg-border" />
      </NavigationMenuIndicator>
      <NavigationMenuViewport
        className={cn(
          'navigation-menu-viewport origin-top-center absolute left-0 top-full flex w-full justify-center',
          'mt-1.5 overflow-hidden rounded-md border bg-popover shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out transition-[width_height]',
        )}
      />
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  HTMLAnchorElement,
  { className?: string; title: string; children: React.ReactNode; href: string }
>(({ className, title, children, href }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors',
            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
