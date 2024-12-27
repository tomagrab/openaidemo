import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LoaderIcon } from 'lucide-react';

type ChatWidgetHeaderBadgeProps = {
  sessionLoading: boolean;
  rtcLoading: boolean;
  combinedError: object | null;
};

export default function ChatWidgetHeaderBadge({
  sessionLoading,
  rtcLoading,
  combinedError,
}: ChatWidgetHeaderBadgeProps) {
  const isConnected = !combinedError && !sessionLoading && !rtcLoading;
  const isLoading = sessionLoading || rtcLoading;
  const isError = !!combinedError;

  const badgeClassName = cn(
    'text-white',
    isConnected ? 'bg-green-500' : '',
    isLoading ? 'bg-yellow-500 flex gap-2' : '',
    isError ? 'bg-red-500' : '',
  );

  const badgeText = isConnected ? (
    'Connected'
  ) : isLoading ? (
    <>
      <LoaderIcon className="h-4 w-4 animate-spin" /> Loading
    </>
  ) : (
    'Error'
  );

  return (
    <Badge variant="default" className={badgeClassName}>
      {badgeText}
    </Badge>
  );
}
