'use client';

import { useState, useRef } from 'react';

interface Props {
  ephemeralKey: string;
}

export default function ChatClient({ ephemeralKey }: Props) {
  const [connected, setConnected] = useState(false);
  const [responseText, setResponseText] = useState('');
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function initConnection() {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    pc.ontrack = e => {
      audioEl.srcObject = e.streams[0];
    };
    audioRef.current = audioEl;

    const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
    pc.addTrack(ms.getTracks()[0]);

    const dc = pc.createDataChannel('oai-events');
    dcRef.current = dc;

    dc.addEventListener('message', e => {
      const event = JSON.parse(e.data);
      if (event.type === 'response.text.delta') {
        // Append the delta text to the current responseText state
        setResponseText(prev => prev + event.delta);
      } else if (event.type === 'response.done') {
        // The final response is now complete
        // event.response.output[0].content will contain the final message as well
        // We already appended everything as it came in, so responseText should contain full response.
        // If you want, you could also set the responseText here to the final text from event.response.
      }
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = 'https://api.openai.com/v1/realtime';
    const model = 'gpt-4o-realtime-preview-2024-12-17';

    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
      },
    });

    const answer: RTCSessionDescriptionInit = {
      type: 'answer' as RTCSdpType,
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    setConnected(true);
  }

  function sendMessage(prompt: string) {
    if (!dcRef.current) return;

    // Clear the UI before sending a new request
    setResponseText('');

    // Create a user message event
    const userMsgEvent = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt,
          },
        ],
      },
    };
    dcRef.current.send(JSON.stringify(userMsgEvent));

    // Request a model response
    const responseEvent = {
      type: 'response.create',
      response: {
        modalities: ['text'],
      },
    };
    dcRef.current.send(JSON.stringify(responseEvent));
  }

  return (
    <div>
      {!connected && (
        <button onClick={initConnection}>Connect to Realtime API</button>
      )}
      {connected && (
        <div>
          <button onClick={() => sendMessage('Tell me a joke!')}>
            Ask for a joke
          </button>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            {responseText}
          </div>
        </div>
      )}
    </div>
  );
}
