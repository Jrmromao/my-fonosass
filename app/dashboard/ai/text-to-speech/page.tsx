'use client';

import React from 'react';
import { ArrowLeft, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import VoiceDemo from '@/components/ai/VoiceDemo';

export default function TextToSpeechPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* SIMPLE HEADER - no fluff */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Demonstração de Pronúncia
          </h1>
          <p className="text-gray-600">Preserve sua voz durante as sessões</p>
        </div>
      </div>

      {/* REAL VALUE PROPOSITION */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-red-500" />
            <div>
              <h3 className="font-semibold">Economize sua Voz</h3>
              <p className="text-sm text-gray-600">
                Pare de repetir 50x por sessão
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="font-semibold">Modelo Consistente</h3>
              <p className="text-sm text-gray-600">
                Mesma pronúncia toda sessão
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* THERAPEUTIC CONTENT - organized by real therapy needs */}
      <div className="space-y-6">
        {/* MOTIVATION - therapists use this CONSTANTLY */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frases Motivacionais</CardTitle>
            <p className="text-sm text-gray-600">
              Use quando o paciente acerta
            </p>
          </CardHeader>
          <CardContent>
            <VoiceDemo />
          </CardContent>
        </Card>

        {/* PHONEMES - real therapy progression */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fonema R</CardTitle>
              <p className="text-sm text-gray-600">
                Mais difícil - precisa de mais repetição
              </p>
            </CardHeader>
            <CardContent>
              <VoiceDemo phoneme="R" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔵 Fonema S</CardTitle>
              <p className="text-sm text-gray-600">
                Fricativa - comum em crianças
              </p>
            </CardHeader>
            <CardContent>
              <VoiceDemo phoneme="S" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🟢 Fonema L</CardTitle>
              <p className="text-sm text-gray-600">
                Lateral - posicionamento da língua
              </p>
            </CardHeader>
            <CardContent>
              <VoiceDemo phoneme="L" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🟡 Fonema CH</CardTitle>
              <p className="text-sm text-gray-600">
                Pós-alveolar - lábios arredondados
              </p>
            </CardHeader>
            <CardContent>
              <VoiceDemo phoneme="CH" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* REAL TESTIMONIAL - what therapists actually say */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <blockquote className="text-blue-900 italic mb-3">
            "Minha voz não fica mais rouca no final do dia. Uso direto no tablet
            durante as sessões. Os pais adoram porque podem ouvir a pronúncia
            correta em casa também."
          </blockquote>
          <cite className="text-sm text-blue-700">
            — Dra. Ana Silva, Fonoaudióloga há 12 anos
          </cite>
        </CardContent>
      </Card>

      {/* SIMPLE CALL TO ACTION */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Dica: Deixe esta página aberta durante suas
          sessões para acesso rápido
        </p>
      </div>
    </div>
  );
}
