import { useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import './VoiceOverlay.css';

export default function VoiceOverlay({ isOpen, onClose, onTranscript }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const handleStop = useCallback(
    ({ base64, mimeType }) => {
      onTranscript?.({ base64, mimeType });
      onClose();
    },
    [onTranscript, onClose]
  );

  const {
    isRecording,
    audioLevel,
    analyserData,
    startRecording,
    stopRecording,
    toggleRecording,
  } = useVoice({ onStop: handleStop });

  // Start recording when overlay opens
  useEffect(() => {
    if (isOpen && !isRecording) {
      startRecording();
    }
    return () => {
      if (isRecording) stopRecording();
    };
  }, [isOpen]);

  // Waveform visualization
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      const data = analyserData;
      const barCount = 48;
      const barWidth = 3;
      const gap = 3;
      const totalWidth = barCount * (barWidth + gap);
      const startX = (width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * data.length);
        const value = (data[dataIndex] || 0) / 255;
        const barHeight = Math.max(4, value * height * 0.7);

        const x = startX + i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Gradient colors
        const hue = 260 + (i / barCount) * 60; // purple to cyan
        ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${0.5 + value * 0.5})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, analyserData]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isRecording) stopRecording();
    onClose();
  };

  return (
    <div className="voice-overlay" onClick={handleClose}>
      <div className="voice-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="voice-close" onClick={handleClose}>
          <X size={20} />
        </button>

        {/* Pulsing ring */}
        <div className={`voice-ring-container ${isRecording ? 'recording' : ''}`}>
          <div
            className="voice-ring voice-ring-outer"
            style={{ transform: `scale(${1 + audioLevel * 0.4})` }}
          />
          <div
            className="voice-ring voice-ring-middle"
            style={{ transform: `scale(${1 + audioLevel * 0.25})` }}
          />
          <button className="voice-mic-btn" onClick={toggleRecording}>
            {isRecording ? <Mic size={32} /> : <MicOff size={32} />}
          </button>
        </div>

        {/* Waveform */}
        <canvas ref={canvasRef} className="voice-waveform" />

        {/* Status text */}
        <p className="voice-status">
          {isRecording ? 'Listening… Click mic to stop' : 'Click mic to start recording'}
        </p>
      </div>
    </div>
  );
}
