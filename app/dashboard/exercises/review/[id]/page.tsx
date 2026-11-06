import { prisma } from '@/app/db';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { notFound } from 'next/navigation';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'fonosapp';

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

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      files: {
        select: { id: true, name: true, s3Key: true, fileType: true },
        take: 1,
      },
    },
  });
  if (!activity) notFound();

  // Verify token for unauthenticated access
  const hasValidToken = token && activity.approvalToken === token;

  // After an approve/reject action the token is consumed, so the redirect back
  // here carries a result flag instead of a valid token — show the outcome.
  const actionResult = approved || rejected || already;

  // The per-item page is publicly reachable (no Clerk) so Telegram magic links
  // work. Without a valid token (and no action result) we must not leak the
  // activity's contents — show a neutral message instead.
  if (!hasValidToken && !actionResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-2">Link inválido ou expirado</h1>
          <p className="text-gray-600">
            Este link de revisão não é válido. Verifique o link enviado ou
            acesse o painel administrativo.
          </p>
        </div>
      </div>
    );
  }

  const exerciseData = (() => {
    try {
      return JSON.parse(activity.description);
    } catch {
      return { titulo: activity.name, instrucoes: [activity.description] };
    }
  })();

  // Presign the actual worksheet so the reviewer sees the real activity, not
  // just metadata. Only done once access is authorized (valid token/result).
  const file = activity.files[0];
  let fileUrl: string | null = null;
  if (file?.s3Key) {
    try {
      fileUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: file.s3Key }),
        { expiresIn: 3600 }
      );
    } catch {
      fileUrl = null;
    }
  }
  const isPdf =
    file?.fileType === 'application/pdf' ||
    file?.s3Key?.toLowerCase().endsWith('.pdf');

  return (
    <div className="max-w-4xl mx-auto p-6">
      {approved && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          Exercício aprovado e publicado com sucesso.
        </div>
      )}
      {rejected && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          Exercício rejeitado.
        </div>
      )}
      {already && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          Este exercício já foi aprovado anteriormente.
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
            {activity.status === 'PUBLISHED' && 'Publicado'}
            {activity.status === 'PENDING_REVIEW' && 'Aguardando revisão'}
            {activity.status === 'REJECTED' && 'Rejeitado'}
            {activity.status === 'DRAFT' && 'Rascunho'}
          </span>
        </div>

        {/* The actual activity — reviewers must see the real worksheet, not
            just the metadata, before approving or rejecting. */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Atividade</h3>
          {fileUrl ? (
            isPdf ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={fileUrl}
                  title={file?.name || 'Atividade'}
                  className="w-full"
                  style={{ height: '80vh' }}
                />
              </div>
            ) : (
              <img
                src={fileUrl}
                alt={file?.name || 'Atividade'}
                className="w-full rounded-lg border border-gray-200"
              />
            )
          ) : (
            <p className="text-sm text-gray-500">
              Não foi possível carregar o arquivo da atividade.
            </p>
          )}
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              Abrir em nova aba / Descarregar
            </a>
          )}
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
              Aprovar e Publicar
            </a>
            <a
              href={`/api/exercises/${id}/reject?token=${token}`}
              className="flex-1 text-center px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Rejeitar
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
