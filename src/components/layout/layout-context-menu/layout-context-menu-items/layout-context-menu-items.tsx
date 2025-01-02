'use client';
import {
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Textarea } from '@/components/ui/textarea';
import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

export function LayoutContextMenuItems() {
  const {
    homePageContent,
    setHomePageContent,
    chatWidgetEnabled,
    setChatWidgetEnabled,
  } = useOpenAIDemoContext();
  const { theme, setTheme } = useTheme();

  const pathname = usePathname();

  const isHomePage = pathname === '/';

  return (
    <>
      <ContextMenuItem onClick={() => setChatWidgetEnabled(!chatWidgetEnabled)}>
        {chatWidgetEnabled ? 'Disable' : 'Enable'} Chat Widget
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>Theme</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuCheckboxItem
            checked={theme === 'light'}
            onClick={() => setTheme('light')}
          >
            Light
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={theme === 'dark'}
            onClick={() => setTheme('dark')}
          >
            Dark
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={theme === 'system'}
            onClick={() => setTheme('system')}
          >
            System
          </ContextMenuCheckboxItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      {isHomePage ? (
        <>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>Home Page Content</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <Textarea
                onInput={e =>
                  setHomePageContent((e.target as HTMLTextAreaElement).value)
                }
                value={homePageContent ?? ''}
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
        </>
      ) : null}
    </>
  );
}
