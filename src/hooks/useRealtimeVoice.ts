import { useState, useCallback, useRef, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

interface RealtimeEvent {
  type: string;
  [key: string]: unknown;
}

export function useRealtimeVoice() {
  const [state, setState] = useState<VoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    checkConfiguration();
    return () => {
      disconnect();
    };
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/realtime-voice-session`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      setIsConfigured(data.success);
    } catch {
      setIsConfigured(false);
    }
  };

  const connect = useCallback(async () => {
    if (state !== 'idle') return;

    setState('connecting');
    setError(null);
    setTranscript('');
    setResponse('');

    try {
      const sessionResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/realtime-voice-session`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            voice: 'verse',
            instructions: 'You are Orbi, a helpful and friendly voice assistant for an ambient smart home dashboard. Keep your responses concise, warm, and conversational. You can help with weather updates, news summaries, reminders, and general questions. Respond naturally as if having a casual conversation.',
          }),
        }
      );

      const sessionData = await sessionResponse.json();

      if (!sessionData.success || !sessionData.data?.client_secret) {
        throw new Error(sessionData.error || 'Failed to create session');
      }

      const { client_secret } = sessionData.data;

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
        audioElementRef.current.autoplay = true;
      }

      pc.ontrack = (event) => {
        audioElementRef.current!.srcObject = event.streams[0];
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioTrack = stream.getTracks()[0];
      pc.addTrack(audioTrack, stream);

      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        };
        dc.send(JSON.stringify(sessionConfig));
        setState('listening');
      };

      dc.onmessage = (event) => {
        try {
          const realtimeEvent: RealtimeEvent = JSON.parse(event.data);
          handleRealtimeEvent(realtimeEvent);
        } catch (err) {
          console.error('Failed to parse realtime event:', err);
        }
      };

      dc.onerror = (err) => {
        console.error('Data channel error:', err);
        setError('Connection error');
        setState('error');
      };

      dc.onclose = () => {
        setState('idle');
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${client_secret.value}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime API');
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setState('error');
      disconnect();
    }
  }, [state]);

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        setState('listening');
        break;

      case 'input_audio_buffer.speech_stopped':
        setState('thinking');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          setTranscript(event.transcript as string);
        }
        break;

      case 'response.audio_transcript.delta':
        if (event.delta) {
          setResponse((prev) => prev + (event.delta as string));
        }
        break;

      case 'response.audio.delta':
        setState('speaking');
        break;

      case 'response.audio_transcript.done':
        break;

      case 'response.done':
        setState('listening');
        setResponse('');
        break;

      case 'error':
        console.error('Realtime API error:', event);
        setError((event.error as { message?: string })?.message || 'API error');
        break;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }

    setState('idle');
    setTranscript('');
    setResponse('');
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      return;
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text,
          },
        ],
      },
    };

    dataChannelRef.current.send(JSON.stringify(event));
    dataChannelRef.current.send(JSON.stringify({ type: 'response.create' }));
    setTranscript(text);
    setState('thinking');
  }, []);

  return {
    state,
    error,
    transcript,
    response,
    isConfigured,
    connect,
    disconnect,
    sendTextMessage,
  };
}
