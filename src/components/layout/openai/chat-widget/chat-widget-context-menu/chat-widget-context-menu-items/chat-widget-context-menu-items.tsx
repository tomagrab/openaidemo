'use client';
import { ContextMenuItem } from '@/components/ui/context-menu';

type ChatWidgetContextMenuItemsProps = {
  setChatWidgetEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ChatWidgetContextMenuItems({
  setChatWidgetEnabled,
}: ChatWidgetContextMenuItemsProps) {
  return (
    <ContextMenuItem onClick={() => setChatWidgetEnabled(false)}>
      Disable Chat Widget
    </ContextMenuItem>
  );
}
