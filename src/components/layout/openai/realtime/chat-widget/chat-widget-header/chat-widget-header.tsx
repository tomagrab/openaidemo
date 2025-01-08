import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import { turn_detection } from '@/lib/types/openai/openai';
import ChatWidgetHeaderBadge from '@/components/layout/openai/realtime/chat-widget/chat-widget-header/chat-widget-header-badge/chat-widget-header-badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Volume2Icon, VolumeOffIcon, MinusIcon } from 'lucide-react';

type ChatWidgetHeaderProps = {
  handleCloseWidget: () => void;
  turnDetection: turn_detection;
  toggleVADMode: () => Promise<void>;
  loading: boolean;
  combinedError: object | null;
};

export default function ChatWidgetHeader({
  handleCloseWidget,
  turnDetection,
  toggleVADMode,
  loading,
  combinedError,
}: ChatWidgetHeaderProps) {
  const { headerEmoji } = useOpenAIDemoContext();

  return (
    <div className="flex items-center justify-between border-b px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {headerEmoji ? (
            <span className="text-2xl">{headerEmoji}</span>
          ) : (
            <span className="text-2xl">🤖</span>
          )}
          <h2 className="font-semibold">V-Bot</h2>
        </div>
        <ChatWidgetHeaderBadge
          sessionLoading={loading}
          rtcLoading={loading}
          combinedError={combinedError}
        />
      </div>

      <div className="flex items-center gap-2">
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

        <button
          className="text-muted-foreground hover:text-foreground"
          onClick={() => handleCloseWidget()}
          title="Minimize chat"
        >
          <MinusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
