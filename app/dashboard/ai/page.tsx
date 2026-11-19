import ExerciseGenerator from '@/components/ai/ExerciseGenerator';

export default function AIPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-violet-950">
          Assistente IA - Almanaque da Fala
        </h1>
        <p className="text-neutral-600 mt-2">
          Gere exercícios personalizados usando inteligência artificial
        </p>
      </div>

      <ExerciseGenerator />
    </div>
  );
}
