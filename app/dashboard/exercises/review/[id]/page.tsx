import { prisma } from '@/app/db';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    token?: string;
    approved?: string;
    rejected?: string;
    already?: string;
  }>;
}

export default async function ExerciseReviewPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { token, approved, rejected, already } = await searchParams;

  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) notFound();

  // Verify token for unauthenticated access
  const hasValidToken = token && activity.approvalToken === token;
  const exerciseData = (() => {
    try {
      return JSON.parse(activity.description);
    } catch {
      return { titulo: activity.name, instrucoes: [activity.description] };
    }
  })();

  return (
    <div className="max-w-2xl mx-auto p-6">
      {approved && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✅ Exercício aprovado e publicado com sucesso!
        </div>
      )}
      {rejected && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          ❌ Exercício rejeitado.
        </div>
      )}
      {already && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          ⚠️ Este exercício já foi aprovado anteriormente.
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {exerciseData.titulo || activity.name}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activity.status === 'PUBLISHED'
                ? 'bg-green-100 text-green-800'
                : activity.status === 'PENDING_REVIEW'
                  ? 'bg-yellow-100 text-yellow-800'
                  : activity.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
          >
            {activity.status === 'PUBLISHED' && '✅ Publicado'}
            {activity.status === 'PENDING_REVIEW' && '⏳ Aguardando revisão'}
            {activity.status === 'REJECTED' && '❌ Rejeitado'}
            {activity.status === 'DRAFT' && '📝 Rascunho'}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-500">Fonema:</span>
            <span className="ml-2 font-medium">/{activity.phoneme}/</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Dificuldade:</span>
            <span className="ml-2 font-medium">{activity.difficulty}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Faixa etária:</span>
            <span className="ml-2 font-medium">{activity.ageRange}</span>
          </div>

          {exerciseData.objetivo && (
            <div>
              <h3 className="font-semibold text-gray-700">Objetivo</h3>
              <p className="text-gray-600">{exerciseData.objetivo}</p>
            </div>
          )}

          {exerciseData.instrucoes && (
            <div>
              <h3 className="font-semibold text-gray-700">Instruções</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                {exerciseData.instrucoes.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {exerciseData.materiais && (
            <div>
              <h3 className="font-semibold text-gray-700">Materiais</h3>
              <ul className="list-disc list-inside text-gray-600">
                {exerciseData.materiais.map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {exerciseData.tempo && (
            <div>
              <span className="text-sm text-gray-500">Tempo:</span>
              <span className="ml-2">{exerciseData.tempo}</span>
            </div>
          )}

          {exerciseData.observacoes && (
            <div>
              <h3 className="font-semibold text-gray-700">Observações</h3>
              <p className="text-gray-600">{exerciseData.observacoes}</p>
            </div>
          )}
        </div>

        {hasValidToken && activity.status === 'PENDING_REVIEW' && (
          <div className="mt-6 flex gap-3">
            <a
              href={`/api/exercises/${id}/approve?token=${token}`}
              className="flex-1 text-center px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              ✅ Aprovar e Publicar
            </a>
            <a
              href={`/api/exercises/${id}/reject?token=${token}`}
              className="flex-1 text-center px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              ❌ Rejeitar
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
