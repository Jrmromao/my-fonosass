import { prisma } from '@/app/db';
import { Resource } from '@/services/resourcesService';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ResourcePageClient from './ResourcePageClient';

interface ResourcePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { id } = await params;

  const resource = await prisma.resource.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      isPublished: true,
    },
    select: {
      slug: true,
      title: true,
      description: true,
      category: true,
      ageGroup: true,
      tags: true,
      downloadCount: true,
      rating: true,
      fileSize: true,
      createdAt: true,
    },
  });

  if (!resource) {
    return {
      title: 'Recurso não encontrado',
      description: 'O recurso solicitado não foi encontrado.',
    };
  }

  return {
    title: `${resource.title} - Recursos Gratuitos | Almanaque da Fala`,
    description: resource.description,
    keywords: [
      'recursos gratuitos fonoaudiologia',
      'exercícios fonoaudiológicos',
      resource.category.toLowerCase(),
      ...resource.tags,
      'download grátis',
      'terapia da fala',
    ],
    openGraph: {
      title: resource.title,
      description: resource.description,
      type: 'article',
      url: `https://www.almanaquedafala.com.br/recursos-gratuitos/${resource.slug || id}`,
      images: [
        {
          url: '/images/resources/og-default.jpg',
          width: 1200,
          height: 630,
          alt: resource.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resource.title,
      description: resource.description,
      images: ['/images/resources/og-default.jpg'],
    },
    alternates: {
      canonical: `https://www.almanaquedafala.com.br/recursos-gratuitos/${resource.slug || id}`,
    },
  };
}

export async function generateStaticParams() {
  const resources = await prisma.resource.findMany({
    where: {
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  return resources.map((resource) => ({
    id: resource.slug || resource.id,
  }));
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { id } = await params;

  const resource = await prisma.resource.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      type: true,
      category: true,
      ageGroup: true,
      duration: true,
      fileSize: true,
      downloadCount: true,
      viewCount: true,
      rating: true,
      tags: true,
      downloadUrl: true,
      viewUrl: true,
      thumbnailUrl: true,
      isFree: true,
      isFeatured: true,
      slug: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!resource) {
    notFound();
  }

  // If we found the resource by ID but it has a slug, redirect to the slug URL
  if (resource.id === id && resource.slug) {
    redirect(`/recursos-gratuitos/${resource.slug}`);
  }

  // Convert null values to undefined to match Resource interface
  const resourceData: Resource = {
    ...resource,
    slug: resource.slug || id,
    duration: resource.duration ?? undefined,
    fileSize: resource.fileSize ?? undefined,
    thumbnailUrl: resource.thumbnailUrl ?? undefined,
    content: resource.content ?? undefined,
  };

  return <ResourcePageClient resource={resourceData} />;
}
