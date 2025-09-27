'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Play, Download, CheckCircle } from 'lucide-react';

export default function TextToSpeech() {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Ready-to-use therapeutic phrases that solve real problems
  const therapeuticPhrases = {
    'R forte': [
      'Vamos fazer o som do motor: rrrrrr',
      'Rato, roda, rosa - repita comigo',
      'Carro, ferro, barro - bem devagar',
      'O rato roeu a roupa do rei',
    ],
    'R fraco': [
      'Toque a língua no céu da boca: cara, para',
      'Porta, carta, forte - suavemente',
      'Amor, calor, doutor - bem claro',
      'A arara subiu na árvore',
    ],
    'S e Z': [
      'Som da cobra: sssss - sapo, sol, suco',
      'Som da abelha: zzzzz - zebra, zero',
      'Casa com S, casa com Z - diferente?',
      'O sapo e a zebra são amigos',
    ],
    'L e LH': [
      'Língua atrás dos dentes: lua, lata',
      'Grude a língua: palha, folha',
      'Bola, cola, mala - bem claro',
      'A filha colheu flores',
    ],
    Motivação: [
      'Muito bem! Você conseguiu!',
      'Perfeito! Continue assim!',
      'Que progresso incrível!',
      'Excelente! Agora você sabe!',
    ],
  };

  // Browser TTS - Simple and reliable
  const playPhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8; // Slower for therapy

      // Find Portuguese voice
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(
        (voice) => voice.lang.includes('pt') || voice.lang.includes('BR')
      );
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setSelectedExercise(phrase);
    } else {
      alert('Seu navegador não suporta síntese de voz');
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-purple-600" />
            Demonstração de Pronúncia
          </CardTitle>
          <p className="text-sm text-gray-600">
            Clique para ouvir a pronúncia correta e use durante suas sessões
          </p>
        </CardHeader>
      </Card>

      {/* Exercise Categories */}
      {Object.entries(therapeuticPhrases).map(([category, phrases]) => (
        <Card key={category} className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-900">
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {phrases.map((phrase, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm flex-1">{phrase}</span>
                <Button
                  onClick={() => playPhrase(phrase)}
                  disabled={isPlaying}
                  size="sm"
                  className="ml-3 bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Currently Playing */}
      {isPlaying && selectedExercise && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Volume2 className="h-4 w-4 text-green-600 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Reproduzindo:
                  </p>
                  <p className="text-sm text-green-700">{selectedExercise}</p>
                </div>
              </div>
              <Button
                onClick={stopSpeech}
                size="sm"
                variant="outline"
                className="border-green-300 hover:bg-green-100"
              >
                Parar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Value */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 Como Usar na Prática:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Durante a sessão:</strong> Clique e deixe o paciente
                  ouvir o modelo correto
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Preserve sua voz:</strong> Evite repetir a mesma
                  palavra 50 vezes por dia
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Consistência:</strong> Mesma pronúncia perfeita toda
                  sessão
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Motivação:</strong> Use frases de encorajamento quando
                  o paciente acerta
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
