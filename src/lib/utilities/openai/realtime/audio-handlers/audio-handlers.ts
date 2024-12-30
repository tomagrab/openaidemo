import { RealtimeServerEvent } from '@/lib/types/openai/openai';
import { toast } from 'sonner';

function handleInputAudioBufferCommitted(
  event: RealtimeServerEvent & { type: 'input_audio_buffer.committed' },
) {
  toast('Audio buffer committed');
  console.log('Audio buffer committed:', event);
}

function handleInputAudioBufferCleared(
  event: RealtimeServerEvent & { type: 'input_audio_buffer.cleared' },
) {
  toast('Audio buffer cleared');
  console.log('Audio buffer cleared:', event);
}

function handleInputAudioBufferSpeechStarted(
  event: RealtimeServerEvent & { type: 'input_audio_buffer.speech_started' },
) {
  toast('Speech started');
  console.log('Speech started:', event);
}

function handleInputAudioBufferSpeechStopped(
  event: RealtimeServerEvent & { type: 'input_audio_buffer.speech_stopped' },
) {
  toast('Speech stopped');
  console.log('Speech stopped:', event);
}

function handleResponseAudioTranscriptDelta(
  event: RealtimeServerEvent & { type: 'response.audio_transcript.delta' },
) {
  toast('Audio transcript delta');
  console.log('Audio transcript delta: ', event);
}

function handleResponseAudioTranscriptDone(
  event: RealtimeServerEvent & { type: 'response.audio_transcript.done' },
) {
  toast('Audio transcript done');
  console.log('Audio transcript done: ', event);
}

function handleResponseAudioDelta(
  event: RealtimeServerEvent & { type: 'response.audio.delta' },
) {
  toast('Audio delta arrived');
  console.log('Audio delta: ', event);
}

function handleResponseAudioDone(
  event: RealtimeServerEvent & { type: 'response.audio.done' },
) {
  toast('Audio done streaming');
  console.log('Audio done: ', event);
}

export {
  handleInputAudioBufferCommitted,
  handleInputAudioBufferCleared,
  handleInputAudioBufferSpeechStarted,
  handleInputAudioBufferSpeechStopped,
  handleResponseAudioTranscriptDelta,
  handleResponseAudioTranscriptDone,
  handleResponseAudioDelta,
  handleResponseAudioDone,
};
