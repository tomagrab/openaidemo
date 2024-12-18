'use client';

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  ephemeralKey: string;
}

export default function ChatClient({ ephemeralKey }: Props) {
  const [connected, setConnected] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initConnection = useCallback(async () => {
    setError(null);

    try {
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
          setResponseText(prev => prev + event.delta);
        } else if (event.type === 'response.done') {
          // The final response is complete
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

      if (!sdpResponse.ok) {
        throw new Error(
          'Failed to establish SDP connection with the Realtime API.',
        );
      }

      const answer: RTCSessionDescriptionInit = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      setConnected(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while connecting.',
      );
    }
  }, [ephemeralKey]);

  // Attempt initial connection on mount
  useEffect(() => {
    initConnection();
  }, [initConnection]);

  function sendMessage(prompt: string) {
    if (!dcRef.current) {
      setError('Data channel not established. Please reconnect.');
      return;
    }

    setResponseText('');

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

    const responseEvent = {
      type: 'response.create',
      response: {
        modalities: ['text'],
      },
    };
    dcRef.current.send(JSON.stringify(responseEvent));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  }

  return (
    <div>
      {!connected && !error && (
        <div>Connecting to Realtime API... Please wait.</div>
      )}

      {error && (
        <div>
          <p style={{ color: 'red' }}>Unable to connect: {error}</p>
          <Button variant="secondary" onClick={initConnection}>
            Attempt to Reconnect
          </Button>
        </div>
      )}

      {connected && (
        <div>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <Textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Type your message here..."
            />
            <Button type="submit">Send</Button>
          </form>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            {responseText}
          </div>
        </div>
      )}
    </div>
  );
}
