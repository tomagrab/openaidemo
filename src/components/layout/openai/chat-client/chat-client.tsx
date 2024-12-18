'use client';

import { useState, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRealtimeConnection } from '@/hooks/openai/use-realtime-connection/use-realtime-connection';

interface Props {
  initialEphemeralKey: string;
}

export default function ChatClient({ initialEphemeralKey }: Props) {
  const { connected, error, responseText, sendMessage, attemptReconnect } =
    useRealtimeConnection(initialEphemeralKey);

  const [inputValue, setInputValue] = useState('');

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
          <Button variant="secondary" onClick={attemptReconnect}>
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
