import { turn_detection } from '@/lib/types/openai/openai';
import ChatWidgetHeaderBadge from '@/components/layout/openai/chat-widget/chat-widget-header/chat-widget-header-badge/chat-widget-header-badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Volume2Icon, VolumeOffIcon } from 'lucide-react';

type ChatWidgetHeaderProps = {
  turnDetection: turn_detection;
  toggleVADMode: () => Promise<void>;
  sessionLoading: boolean;
  rtcLoading: boolean;
  combinedError: object | null;
};

export default function ChatWidgetHeader({
  turnDetection,
  toggleVADMode,
  sessionLoading,
  rtcLoading,
  combinedError,
}: ChatWidgetHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-3 py-2">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">V-Bot</h2>
        <ChatWidgetHeaderBadge
          sessionLoading={sessionLoading}
          rtcLoading={rtcLoading}
          combinedError={combinedError}
        />
      </div>

      {/* Toggle Voice icon */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger onClick={toggleVADMode}>
            {turnDetection ? <Volume2Icon /> : <VolumeOffIcon />}
          </TooltipTrigger>
          <TooltipContent>
            {turnDetection
              ? 'Voice is enabled. Click to disable.'
              : 'Voice is disabled. Click to enable.'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
