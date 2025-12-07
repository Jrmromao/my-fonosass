'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Lock, Star } from 'lucide-react';

interface ExercisePreviewModalProps {
  exercise: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ExercisePreviewModal({
  exercise,
  isOpen,
  onClose,
}: ExercisePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            {exercise.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exercise Info */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {exercise.difficulty}
            </Badge>
            <Badge variant="outline">{exercise.type}</Badge>
            {exercise.phoneme && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Fonema: /{exercise.phoneme}/
              </Badge>
            )}
            <Badge variant="outline">{exercise.ageRange}</Badge>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 text-gray-900">
                Descrição do Exercício
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {exercise.description}
              </p>
            </CardContent>
          </Card>

          {/* Preview Content */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">
                  Preview do Conteúdo
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Objetivos do Exercício:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • Desenvolver a articulação do fonema /
                      {exercise.phoneme || 'target'}/
                    </li>
                    <li>• Melhorar a precisão da fala</li>
                    {exercise.difficulty === 'BEGINNER' && (
                      <li>• Introduzir conceitos básicos de articulação</li>
                    )}
                    {exercise.difficulty === 'INTERMEDIATE' && (
                      <li>• Fortalecer a musculatura orofacial</li>
                    )}
                    {exercise.difficulty === 'ADVANCED' && (
                      <li>• Aperfeiçoar técnicas avançadas de articulação</li>
                    )}
                    {exercise.difficulty === 'EXPERT' && (
                      <li>• Dominar padrões complexos de fala</li>
                    )}
                    <li>• Aumentar a consciência fonológica</li>
                    {exercise.ageRange === 'TODDLER' && (
                      <li>• Estimular desenvolvimento da linguagem infantil</li>
                    )}
                    {exercise.ageRange === 'PRESCHOOL' && (
                      <li>• Preparar para alfabetização</li>
                    )}
                    {exercise.ageRange === 'CHILD' && (
                      <li>• Desenvolver habilidades de comunicação escolar</li>
                    )}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Materiais Inclusos:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span>Guia do Terapeuta (PDF)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span>Fichas de Exercícios</span>
                    </div>
                    {exercise.type === 'ANIMALS' && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        <span>Cartões de Animais</span>
                      </div>
                    )}
                    {exercise.type === 'COLOURS' && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <span>Paleta de Cores</span>
                      </div>
                    )}
                    {exercise.type === 'MEANS_OF_TRANSPORT' && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span>Imagens de Transportes</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>Material para Impressão</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span>Instruções Detalhadas</span>
                    </div>
                    {exercise.files && exercise.files.length > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <span>{exercise.files.length} Arquivo(s) Anexo(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">
                    Conteúdo Completo Disponível
                  </h3>
                  <p className="text-sm text-purple-700">
                    5 downloads grátis por mês • Upgrade para downloads
                    ilimitados
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={async () => {
                    try {
                      // Check download limit first
                      const response = await fetch('/api/download-limit');
                      const data = await response.json();

                      if (data.success && data.data.canDownload) {
                        // Record download with exercise details
                        const downloadResponse = await fetch(
                          '/api/download-limit',
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              activityId: exercise.id,
                              fileName: `${exercise.name}_materials.pdf`,
                              fileSize: 1024000, // Mock file size
                            }),
                          }
                        );

                        const downloadData = await downloadResponse.json();

                        if (downloadData.success) {
                          alert(
                            `Download iniciado! Restam ${downloadData.data.remaining} downloads gratuitos.`
                          );
                        } else {
                          alert(downloadData.error || 'Erro no download');
                        }
                      } else {
                        alert(
                          'Limite de downloads atingido! Faça upgrade para Pro.'
                        );
                      }
                    } catch (error) {
                      alert('Erro ao processar download. Tente novamente.');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Grátis
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        '/api/stripe/create-checkout',
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                        }
                      );

                      const data = await response.json();

                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        alert('Erro ao processar pagamento. Tente novamente.');
                      }
                    } catch (error) {
                      alert('Erro ao processar pagamento. Tente novamente.');
                    }
                  }}
                >
                  Upgrade Pro - R$ 39,90/mês
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fechar Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
