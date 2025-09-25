import ExerciseGenerator from '@/components/ai/ExerciseGenerator';

export default function AIPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Assistente IA para Fonoaudiologia
        </h1>
        <p className="text-gray-600 mt-2">
          Gere exercícios personalizados usando inteligência artificial
        </p>
      </div>

      <ExerciseGenerator />
    </div>
  );
}
