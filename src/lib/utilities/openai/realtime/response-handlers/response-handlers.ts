import {
  RealtimeFunctionCallDeltaEvent,
  RealtimeResponseDoneEvent,
  RealtimeServerEvent,
  RealtimeTextDeltaEvent,
} from '@/lib/types/openai/openai';
import { toast } from 'sonner';

function handleResponseCreated(
  event: RealtimeServerEvent & { type: 'response.created' },
  setIsResponseInProgress: (val: boolean) => void,
) {
  setIsResponseInProgress(true);
}

function handleResponseDone(
  event: RealtimeResponseDoneEvent,
  userCallback: (evt: RealtimeResponseDoneEvent) => void,
) {
  userCallback(event);
}

function handleResponseCancelled(
  event: RealtimeServerEvent & { type: 'response.cancelled' },
) {
  toast('Response cancelled');
  console.log('Response cancelled: ', event);
}

function handleResponseTextDelta(
  event: RealtimeTextDeltaEvent,
  userCallback: (evt: RealtimeTextDeltaEvent) => void,
) {
  userCallback(event);
}

function handleResponseTextDone(
  event: RealtimeServerEvent & { type: 'response.text.done' },
) {
  toast('response.text.done');
  console.log('response.text.done: ', event);
}

function handleResponseFunctionCallArgumentsDelta(
  event: RealtimeFunctionCallDeltaEvent,
  userCallback: (evt: RealtimeFunctionCallDeltaEvent) => void,
) {
  userCallback(event);
}

function handleResponseFunctionCallArgumentsDone(
  event: RealtimeServerEvent & {
    type: 'response.function_call_arguments.done';
  },
) {
  toast('Function call arguments done');
  console.log('Function call arguments done: ', event);
}

function handleResponseOutputItemAdded(
  event: RealtimeServerEvent & { type: 'response.output_item.added' },
) {
  toast('Response output item added');
  console.log('Response output item added: ', event);
}

function handleResponseOutputItemDone(
  event: RealtimeServerEvent & { type: 'response.output_item.done' },
) {
  toast('Response output item done');
  console.log('Response output item done: ', event);
}

function handleResponseContentPartAdded(
  event: RealtimeServerEvent & { type: 'response.content_part.added' },
) {
  toast('Response content part added');
  console.log('Response content part added: ', event);
}

function handleResponseContentPartDone(
  event: RealtimeServerEvent & { type: 'response.content_part.done' },
) {
  toast('Response content part done');
  console.log('Response content part done: ', event);
}


function handleResponseRateLimitsUpdated(
  event: RealtimeServerEvent & { type: 'rate_limits.updated' },
) {
  toast(`Rate limits updated`);
  console.log('Rate limits updated:', event);
}

function handleResponseErrorEvent(
  event: RealtimeServerEvent & { type: 'error'; code?: string },
  refreshPage: () => void,
) {
  if (event.code === 'session_expired') {
    toast.error('Session expired. Reloading...');
    refreshPage();
  } else {
    toast.error('Realtime error occurred.');
  }
}

export {
  handleResponseCreated,
  handleResponseDone,
  handleResponseCancelled,
  handleResponseTextDelta,
  handleResponseTextDone,
  handleResponseFunctionCallArgumentsDelta,
  handleResponseFunctionCallArgumentsDone,
  handleResponseOutputItemAdded,
  handleResponseOutputItemDone,
  handleResponseContentPartAdded,
  handleResponseContentPartDone,
  handleResponseRateLimitsUpdated,
  handleResponseErrorEvent,
};
