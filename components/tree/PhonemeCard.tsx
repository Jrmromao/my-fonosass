import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Phoneme } from './types';  // Removed Example from imports

interface PhonemeCardProps {
    phoneme: Phoneme;
    onClose: () => void;
}

const PhonemeCard: React.FC<PhonemeCardProps> = ({ phoneme, onClose }) => {
    return (
        <Card className="w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold" style={{ color: phoneme.color }}>
                            Som: {phoneme.sound}
                        </h3>
                        <Badge>{phoneme.level}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{phoneme.hint}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    ✕
                </Button>
            </div>

            {/* Content */}
            <Tabs defaultValue="practice" className="p-6">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="practice">Prática</TabsTrigger>
                    <TabsTrigger value="examples">Exemplos</TabsTrigger>
                    <TabsTrigger value="activities">Atividades</TabsTrigger>
                </TabsList>

                {/* Practice Tab */}
                <TabsContent value="practice" className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <span>👄</span> Posição da Boca
                        </h4>
                        <p className="text-sm text-gray-600">{phoneme.mouthPosition}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <span>🎯</span> Como Praticar
                        </h4>
                        <ol className="space-y-2 text-sm text-gray-600">
                            <li>1. Observe a posição da boca no espelho</li>
                            <li>2. Repita o som lentamente</li>
                            <li>3. Pratique com as palavras exemplo</li>
                        </ol>
                    </div>
                </TabsContent>

                {/* Examples Tab */}
                <TabsContent value="examples" className="space-y-4">
                    {phoneme.examples.map((example: string, idx: number) => (
                        <div key={idx} className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" style={{ color: phoneme.color }}>
                                    {example}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                                Pratique essa palavra várias vezes
                            </p>
                        </div>
                    ))}
                </TabsContent>

                {/* Activities Tab */}
                <TabsContent value="activities" className="space-y-4">
                    {phoneme.activities.map((activity, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <h4 className="font-bold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                  {idx + 1}
                </span>
                                {activity.title}
                            </h4>
                            <ul className="space-y-2">
                                {activity.steps.map((step, stepIdx) => (
                                    <li key={stepIdx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="p-6 border-t bg-muted/20">
                <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                        <h6 className="font-semibold mb-1">Dicas:</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Pratique por 5-10 minutos</li>
                            <li>• Repita cada exercício 3 vezes</li>
                            <li>• Use o espelho para observar</li>
                            <li>• Faça pausas quando necessário</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PhonemeCard;