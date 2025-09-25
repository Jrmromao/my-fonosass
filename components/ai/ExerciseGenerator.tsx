'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';

interface Exercise {
  titulo: string;
  objetivo: string;
  instrucoes: string[];
  materiais: string[];
  tempo: string;
  observacoes: string;
}

export default function ExerciseGenerator() {
  const [phoneme, setPhoneme] = useState('');
  const [age, setAge] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const generateExercise = async () => {
    if (!phoneme || !age || !difficulty) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneme,
          age: parseInt(age),
          difficulty,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setExercise(data.exercise);
        setMetadata(data.metadata);
      } else {
        alert('Erro ao gerar exercício');
      }
    } catch (error) {
      alert('Erro ao gerar exercício');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!exercise || !metadata) return;

    setPdfLoading(true);
    try {
      const response = await fetch('/api/ai/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise, metadata }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exercicio-${phoneme}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Erro ao gerar PDF');
      }
    } catch (error) {
      alert('Erro ao gerar PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            🤖 Gerador de Exercícios IA - Almanaque da Fala
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Fonema (ex: /r/)"
              value={phoneme}
              onChange={(e) => setPhoneme(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Idade"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediário">Intermediário</SelectItem>
                <SelectItem value="avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateExercise}
            disabled={loading || !phoneme || !age || !difficulty}
            className="w-full"
          >
            {loading ? 'Gerando...' : 'Gerar Exercício'}
          </Button>
        </CardContent>
      </Card>

      {exercise && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📋 {exercise.titulo}</CardTitle>
            <Button
              onClick={downloadPDF}
              disabled={pdfLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {pdfLoading ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Fonema:</strong> {metadata?.phoneme} |
              <strong> Idade:</strong> {metadata?.age} anos |
              <strong> Nível:</strong> {metadata?.difficulty}
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">🎯 Objetivo:</h4>
              <p className="text-sm text-gray-700">{exercise.objetivo}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">📋 Instruções:</h4>
              <ol className="text-sm text-gray-700 space-y-1">
                {exercise.instrucoes.map((instrucao, index) => (
                  <li key={index} className="flex">
                    <span className="mr-2">{index + 1}.</span>
                    <span>{instrucao}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">🧰 Materiais:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {exercise.materiais.map((material, index) => (
                  <li key={index} className="flex">
                    <span className="mr-2">•</span>
                    <span>{material}</span>
                  </li>
                ))}
              </ul>
            </div>

            {exercise.tempo && (
              <div>
                <h4 className="font-semibold text-sm mb-2">⏱️ Duração:</h4>
                <p className="text-sm text-gray-700">{exercise.tempo}</p>
              </div>
            )}

            {exercise.observacoes && (
              <div>
                <h4 className="font-semibold text-sm mb-2">💡 Observações:</h4>
                <p className="text-sm text-gray-700">{exercise.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
