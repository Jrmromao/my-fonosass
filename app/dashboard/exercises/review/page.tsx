import { prisma } from '@/app/db';
import Link from 'next/link';

export default async function ExerciseReviewListPage() {
  const exercises = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      phoneme: true,
      difficulty: true,
      ageRange: true,
      status: true,
      createdAt: true,
    },
  });

  const statusColors: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    DRAFT: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Exercícios ({exercises.length})
      </h1>
      <div className="space-y-3">
        {exercises.map((ex) => (
          <Link
            key={ex.id}
            href={`/dashboard/exercises/review/${ex.id}`}
            className="block p-4 border rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{ex.name}</p>
                <p className="text-sm text-gray-500">
                  /{ex.phoneme}/ • {ex.difficulty} • {ex.ageRange}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${statusColors[ex.status] || ''}`}
              >
                {ex.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
