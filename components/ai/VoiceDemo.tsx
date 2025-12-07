'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Play, Square } from 'lucide-react';

interface VoiceDemoProps {
  phoneme?: string;
  className?: string;
}

export default function VoiceDemo({ phoneme, className = '' }: VoiceDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);

  // REAL therapeutic content that therapists use EVERY DAY
  const therapeuticContent: Record<string, string[]> = {
    R: [
      'RA',
      'RE',
      'RI',
      'RO',
      'RU',
      'RATO',
      'RODA',
      'ROSA',
      'RABO',
      'REDE',
      'CARRO',
      'FERRO',
      'BARRO',
      'TERRA',
      'SERRA',
      'PARA',
      'CARA',
      'MURO',
      'FURO',
      'DURO',
    ],
    S: [
      'SA',
      'SE',
      'SI',
      'SO',
      'SU',
      'SAPO',
      'SUCO',
      'SINO',
      'SEDE',
      'SOLA',
      'CASA',
      'MESA',
      'ROSA',
      'PESO',
      'VASO',
      'PASTA',
      'FESTA',
      'COSTA',
      'LISTA',
      'VISTA',
    ],
    L: [
      'LA',
      'LE',
      'LI',
      'LO',
      'LU',
      'LATA',
      'LIMA',
      'LOBO',
      'LUPA',
      'LEÃO',
      'BOLA',
      'COLA',
      'MALA',
      'SALA',
      'FALA',
      'PALATO',
      'SALADA',
      'MALUCO',
      'PELUDO',
      'GELADO',
    ],
    CH: [
      'CHA',
      'CHE',
      'CHI',
      'CHO',
      'CHU',
      'CHUVA',
      'CHAVE',
      'CHÃO',
      'CHEFE',
      'CHOCOLATE',
      'BICHO',
      'FICHA',
      'ROCHA',
      'FLECHA',
      'BORRACHA',
      'MACHADO',
      'CACHORRO',
      'MOCHILA',
      'SALSICHA',
      'CAPRICHO',
    ],
    default: ['MUITO BEM!', 'PERFEITO!', 'CONTINUE!', 'ÓTIMO!', 'EXCELENTE!'],
  };

  // INSTANT voice feedback - try Google TTS first, fallback to browser
  const playWord = async (word: string) => {
    setIsPlaying(true);
    setCurrentPhrase(word);

    // Try Google TTS first for high quality
    try {
      const response = await fetch('/api/ai/google-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: word,
          voice: 'pt-BR-Wavenet-A', // High quality voice
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const audioBlob = new Blob([blob], { type: 'audio/mpeg' });

        // Convert to data URL for compatibility
        const reader = new FileReader();
        reader.onload = () => {
          const audio = new Audio(reader.result as string);

          audio.oncanplaythrough = async () => {
            try {
              await audio.play();
            } catch {
              // If Google TTS fails to play, use browser TTS
              playBrowserTTS(word);
            }
          };

          audio.onended = () => {
            setIsPlaying(false);
            setCurrentPhrase('');
          };

          audio.onerror = () => {
            // Fallback to browser TTS
            playBrowserTTS(word);
          };

          audio.load();
        };

        reader.onerror = () => {
          // Fallback to browser TTS
          playBrowserTTS(word);
        };

        reader.readAsDataURL(audioBlob);
        return; // Success - don't use browser TTS
      }
    } catch (error) {
      console.log('Google TTS unavailable, using browser TTS');
    }

    // Fallback to browser TTS
    playBrowserTTS(word);
  };

  const playBrowserTTS = (word: string) => {
    if (!('speechSynthesis' in window)) {
      setIsPlaying(false);
      setCurrentPhrase('');
      return;
    }

    window.speechSynthesis.cancel();

    const playCount = repeatMode ? 3 : 1;
    let currentPlay = 0;

    const playOnce = () => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'pt-BR';
      utterance.rate = isSlowMode ? 0.4 : 0.7; // Much slower for therapy
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Find best Portuguese voice
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(
        (voice) => voice.lang.includes('pt-BR') || voice.lang.includes('pt')
      );
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onend = () => {
        currentPlay++;
        if (currentPlay < playCount) {
          // Small pause between repetitions
          setTimeout(() => playOnce(), 300);
        } else {
          setIsPlaying(false);
          setCurrentPhrase('');
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentPhrase('');
      };

      window.speechSynthesis.speak(utterance);
    };

    playOnce();
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentPhrase('');
  };

  const currentWords =
    therapeuticContent[phoneme || 'default'] || therapeuticContent['default'];

  return (
    <Card className={`${className} border border-gray-200`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-blue-600" />
          {phoneme ? `Fonema ${phoneme}` : 'Motivação'}
        </CardTitle>
        <p className="text-xs text-gray-500">
          Clique para demonstrar pronúncia - preserva sua voz
        </p>
      </CardHeader>

      <CardContent>
        {/* SIMPLE GRID - therapists need to click fast during sessions */}
        <div className="space-y-3">
          {/* Speed Controls */}
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant={isSlowMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsSlowMode(!isSlowMode)}
              className="text-xs"
            >
              {isSlowMode ? '🐌 Lento' : '⚡ Normal'}
            </Button>
            <Button
              variant={repeatMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRepeatMode(!repeatMode)}
              className="text-xs"
            >
              {repeatMode ? '🔄 3x' : '1x'}
            </Button>
          </div>

          {/* Word Grid */}
          <div className="grid grid-cols-3 gap-2">
            {currentWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => playWord(word)}
                disabled={isPlaying}
                className="h-10 text-xs font-medium hover:bg-blue-50 hover:border-blue-300"
              >
                {word}
              </Button>
            ))}
          </div>
        </div>

        {/* CLEAR FEEDBACK - therapist knows what's playing */}
        {isPlaying && (
          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-green-800">
                🔊 {currentPhrase}
              </span>
              <div className="text-xs text-green-600">
                {isSlowMode && '🐌 Lento'} {repeatMode && '🔄 3x'}{' '}
                {isSlowMode || repeatMode ? '' : 'Normal'}
              </div>
            </div>
            <Button
              onClick={stopSpeech}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <Square className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* USAGE STATS - show value */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            💡 Voz de alta qualidade • Economiza 30+ repetições por sessão
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
