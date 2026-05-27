'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const AGE_RANGES = ['4-5 anos', '6-8 anos', '8-10 anos', '10-12 anos'];
const PHONEMES = [
  'P',
  'B',
  'T',
  'D',
  'K',
  'G',
  'F',
  'V',
  'S',
  'Z',
  'R',
  'L',
  'CH',
  'J',
  'M',
  'N',
  'NH',
  'LH',
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleItem = (
    item: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    await user?.update({
      unsafeMetadata: {
        onboarded: true,
        preferences: { ageRanges: selectedAges, phonemes: selectedPhonemes },
      },
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-gray-200">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-indigo-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>

          {step === 0 && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Bem-vindo ao Almanaque da Fala
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Vamos personalizar a sua experiência. Leva menos de 1 minuto.
              </p>
              <Button
                onClick={() => setStep(1)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Começar
              </Button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Qual faixa etária dos seus pacientes?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Selecione uma ou mais.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {AGE_RANGES.map((age) => (
                  <button
                    key={age}
                    onClick={() =>
                      toggleItem(age, selectedAges, setSelectedAges)
                    }
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedAges.includes(age)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedAges.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Quais fonemas você mais trabalha?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Selecione os principais.
              </p>
              <div className="grid grid-cols-6 gap-2 mb-6">
                {PHONEMES.map((p) => (
                  <button
                    key={p}
                    onClick={() =>
                      toggleItem(p, selectedPhonemes, setSelectedPhonemes)
                    }
                    className={`px-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedPhonemes.includes(p)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    /{p}/
                  </button>
                ))}
              </div>
              <Button
                onClick={handleComplete}
                disabled={selectedPhonemes.length === 0 || saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? 'Salvando...' : 'Concluir'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
