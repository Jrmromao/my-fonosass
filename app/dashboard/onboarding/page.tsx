'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { phonemeLabel } from '@/lib/activityLabels';
import { PHONEME_GROUPS } from '@/lib/phonemes';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Phonemes come from the library taxonomy (R forte/fraco, arquifonemas,
// encontros). Saved values are Activity.phoneme codes, e.g. "R_FORTE".

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
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
        preferences: { phonemes: selectedPhonemes },
      },
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-neutral-200">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-coral-700' : 'bg-neutral-200'}`}
              />
            ))}
          </div>

          {step === 0 && (
            <div>
              <h1 className="text-xl font-bold text-violet-950 mb-2">
                Bem-vindo ao Almanaque da Fala
              </h1>
              <p className="text-sm text-neutral-600 mb-6">
                Vamos personalizar a sua experiência. Leva menos de 1 minuto.
              </p>
              <Button
                onClick={() => setStep(1)}
                className="w-full bg-coral-700 hover:bg-coral-800"
              >
                Começar
              </Button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">
                Quais fonemas você mais trabalha?
              </h2>
              <p className="text-sm text-neutral-600 mb-4">
                Selecione os principais.
              </p>
              <div className="mb-6 max-h-[50vh] space-y-4 overflow-y-auto pr-1">
                {PHONEME_GROUPS.map((group) => (
                  <div key={group.id}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {group.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.entries.map((entry) => {
                        const selected = selectedPhonemes.includes(entry.code);
                        return (
                          <button
                            key={entry.code}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              toggleItem(
                                entry.code,
                                selectedPhonemes,
                                setSelectedPhonemes
                              )
                            }
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              selected
                                ? 'border-coral-700 bg-coral-50 text-coral-800'
                                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                            }`}
                          >
                            {phonemeLabel(entry.code)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleComplete}
                disabled={selectedPhonemes.length === 0 || saving}
                className="w-full bg-coral-700 hover:bg-coral-800"
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
