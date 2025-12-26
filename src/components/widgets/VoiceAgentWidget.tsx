import { useState } from 'react';
import { Mic, MicOff, Volume2, Loader2, AlertCircle, Send, X } from 'lucide-react';
import { useRealtimeVoice, type VoiceState } from '../../hooks/useRealtimeVoice';
import type { WidgetComponentProps } from '../../types';

const stateColors: Record<VoiceState, string> = {
  idle: 'from-gray-400 to-gray-500',
  connecting: 'from-amber-400 to-orange-500',
  listening: 'from-teal-400 to-cyan-500',
  thinking: 'from-blue-400 to-indigo-500',
  speaking: 'from-emerald-400 to-teal-500',
  error: 'from-rose-400 to-red-500',
};

const stateGlows: Record<VoiceState, string> = {
  idle: 'rgba(156, 163, 175, 0.3)',
  connecting: 'rgba(251, 191, 36, 0.4)',
  listening: 'rgba(20, 184, 166, 0.5)',
  thinking: 'rgba(99, 102, 241, 0.4)',
  speaking: 'rgba(16, 185, 129, 0.5)',
  error: 'rgba(244, 63, 94, 0.4)',
};

const stateLabels: Record<VoiceState, string> = {
  idle: 'Tap to speak',
  connecting: 'Connecting...',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
  error: 'Error occurred',
};

export function VoiceAgentWidget({ isAmbient }: WidgetComponentProps) {
  const {
    state,
    error,
    transcript,
    response,
    isConfigured,
    connect,
    disconnect,
    sendTextMessage,
  } = useRealtimeVoice();

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');

  const isActive = state !== 'idle' && state !== 'error';
  const pulseClass = state === 'listening' || state === 'speaking' ? 'animate-pulse' : '';

  const handleOrbClick = () => {
    if (isAmbient) return;

    if (state === 'idle' || state === 'error') {
      connect();
    } else {
      disconnect();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && isActive) {
      sendTextMessage(textInput.trim());
      setTextInput('');
      setShowTextInput(false);
    }
  };

  if (isConfigured === null) {
    return (
      <div className="relative w-64 rounded-2xl">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-glass rounded-2xl border border-white/40" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }} />
        <div className="relative p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
          <p className="text-sm font-light text-gray-600">Voice Agent</p>
          <p className="text-xs font-light text-gray-400 mt-1">Checking...</p>
        </div>
      </div>
    );
  }

  if (isConfigured === false) {
    return (
      <div className="relative w-64 rounded-2xl">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-glass rounded-2xl border border-white/40" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }} />
        <div className="relative p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <MicOff className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-light text-gray-600">Voice Agent</p>
          <p className="text-xs font-light text-gray-400 mt-1">API key required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-72 rounded-2xl">
      <div className="absolute inset-0 bg-white/25 backdrop-blur-glass rounded-2xl border border-white/40" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
      }} />

      <div className="relative p-6">
        <div className="flex flex-col items-center">
          <button
            onClick={handleOrbClick}
            disabled={isAmbient || state === 'connecting'}
            className={`relative w-20 h-20 rounded-full transition-all duration-500 ${
              isAmbient ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'
            }`}
          >
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${stateColors[state]} ${pulseClass} transition-all duration-500`}
              style={{
                boxShadow: `0 0 30px ${stateGlows[state]}, inset 0 2px 4px rgba(255,255,255,0.3)`,
              }}
            />

            {state === 'listening' && (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/50 to-cyan-500/50 animate-ping" />
                <div className="absolute inset-[-8px] rounded-full border-2 border-teal-400/30 animate-pulse" />
              </>
            )}

            {state === 'speaking' && (
              <div className="absolute inset-[-4px] rounded-full">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-emerald-400/30"
                    style={{
                      animation: `ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center text-white">
              {state === 'idle' && <Mic className="w-8 h-8" strokeWidth={1.5} />}
              {state === 'connecting' && <Loader2 className="w-8 h-8 animate-spin" strokeWidth={1.5} />}
              {state === 'listening' && <Mic className="w-8 h-8" strokeWidth={1.5} />}
              {state === 'thinking' && <Loader2 className="w-8 h-8 animate-spin" strokeWidth={1.5} />}
              {state === 'speaking' && <Volume2 className="w-8 h-8" strokeWidth={1.5} />}
              {state === 'error' && <AlertCircle className="w-8 h-8" strokeWidth={1.5} />}
            </div>
          </button>

          <p className={`mt-4 text-sm font-light transition-colors duration-300 ${
            state === 'error' ? 'text-rose-500' : 'text-gray-600'
          }`}>
            {error || stateLabels[state]}
          </p>

          {transcript && (
            <div className="mt-3 w-full p-3 rounded-xl bg-white/30 border border-white/40">
              <p className="text-xs font-light text-gray-500 mb-1">You said:</p>
              <p className="text-sm font-light text-gray-700 line-clamp-2">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="mt-2 w-full p-3 rounded-xl bg-teal-50/50 border border-teal-100/50">
              <p className="text-xs font-light text-teal-600 mb-1">Orbi:</p>
              <p className="text-sm font-light text-gray-700 line-clamp-3">{response}</p>
            </div>
          )}

          {!isAmbient && isActive && !showTextInput && (
            <button
              onClick={() => setShowTextInput(true)}
              className="mt-3 px-4 py-2 rounded-lg bg-white/40 hover:bg-white/60 border border-white/50 text-xs font-light text-gray-600 transition-colors"
            >
              Type instead
            </button>
          )}

          {showTextInput && (
            <form onSubmit={handleTextSubmit} className="mt-3 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 pr-16 rounded-xl bg-white/50 border border-white/60 text-sm font-light text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  autoFocus
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowTextInput(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="p-1.5 rounded-lg bg-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {!isAmbient && isActive && (
          <button
            onClick={disconnect}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
