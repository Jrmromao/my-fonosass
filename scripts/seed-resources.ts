import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialResources = [
  {
    title: 'Kit Completo de Exercícios para Desenvolvimento do /R/',
    description:
      'Coleção de 25 exercícios práticos com ilustrações para trabalhar o fonema /r/ em diferentes posições. Inclui atividades lúdicas e progressivas.',
    type: 'PDF',
    category: 'Fonemas',
    ageGroup: '4-6 anos',
    fileSize: '2.3 MB',
    downloadCount: 1247,
    viewCount: 2100,
    rating: 4.8,
    tags: ['fonema-r', 'articulação', 'crianças', 'exercícios'],
    downloadUrl: '/api/resources/download/1',
    viewUrl: '/recursos/fonema-r',
    thumbnailUrl: '/images/resources/fonema-r-thumb.jpg',
    isFree: true,
    isFeatured: true,
  },
  {
    title: 'Exercícios Respiratórios para Melhora da Fala',
    description:
      'Demonstração prática de técnicas respiratórias que auxiliam no desenvolvimento da fala e controle vocal. Ideal para crianças e adultos.',
    type: 'VIDEO',
    category: 'Respiração',
    ageGroup: 'Todas as idades',
    duration: '8 min',
    downloadCount: 850,
    viewCount: 1500,
    rating: 4.9,
    tags: ['respiração', 'controle-vocal', 'técnicas'],
    downloadUrl: '/api/resources/download/2',
    viewUrl: '/recursos/exercicios-respiratorios',
    thumbnailUrl: '/images/resources/respiracao-thumb.jpg',
    isFree: true,
    isFeatured: true,
  },
  {
    title: 'Coleção de Sons e Palavras para Treino Auditivo',
    description:
      'Biblioteca de áudios com diferentes fonemas, palavras e frases para treino auditivo e de pronúncia. Inclui exercícios de discriminação auditiva.',
    type: 'AUDIO',
    category: 'Audição',
    ageGroup: '3-8 anos',
    fileSize: '15.2 MB',
    downloadCount: 2103,
    viewCount: 3200,
    rating: 4.7,
    tags: ['audição', 'discriminação', 'pronúncia', 'fonemas'],
    downloadUrl: '/api/resources/download/3',
    viewUrl: '/recursos/treino-auditivo',
    thumbnailUrl: '/images/resources/audio-thumb.jpg',
    isFree: true,
    isFeatured: true,
  },
  {
    title: 'Guia de Exercícios para TEA',
    description:
      'Recursos especializados para desenvolvimento de linguagem em crianças com Transtorno do Espectro Autista. Inclui estratégias visuais e adaptações.',
    type: 'GUIDE',
    category: 'TEA',
    ageGroup: '2-10 anos',
    fileSize: '4.1 MB',
    downloadCount: 892,
    viewCount: 1200,
    rating: 4.9,
    tags: ['tea', 'autismo', 'linguagem', 'estratégias-visuais'],
    downloadUrl: '/api/resources/download/4',
    viewUrl: '/recursos/guia-tea',
    thumbnailUrl: '/images/resources/tea-thumb.jpg',
    isFree: false,
    isFeatured: false,
  },
  {
    title: 'Série de Vídeos: Fonemas Básicos',
    description:
      'Demonstrações práticas de articulação dos fonemas mais comuns. Ideal para pais e terapeutas que trabalham com crianças.',
    type: 'VIDEO',
    category: 'Fonemas',
    ageGroup: '3-7 anos',
    duration: '25 min',
    downloadCount: 1456,
    viewCount: 2200,
    rating: 4.6,
    tags: ['fonemas', 'articulação', 'demonstração', 'básicos'],
    downloadUrl: '/api/resources/download/5',
    viewUrl: '/recursos/fonemas-basicos',
    thumbnailUrl: '/images/resources/fonemas-basicos-thumb.jpg',
    isFree: true,
    isFeatured: false,
  },
  {
    title: 'Exercícios de Motricidade Orofacial',
    description:
      'Atividades para fortalecimento e coordenação dos músculos da face e boca. Inclui exercícios para lábios, língua e bochechas.',
    type: 'PDF',
    category: 'Motricidade',
    ageGroup: '4-12 anos',
    fileSize: '3.2 MB',
    downloadCount: 678,
    viewCount: 1100,
    rating: 4.5,
    tags: ['motricidade', 'músculos', 'coordenação', 'face'],
    downloadUrl: '/api/resources/download/6',
    viewUrl: '/recursos/motricidade-orofacial',
    thumbnailUrl: '/images/resources/motricidade-thumb.jpg',
    isFree: true,
    isFeatured: false,
  },
  {
    title: 'Atividades de Consciência Fonológica',
    description:
      'Exercícios práticos para desenvolvimento da consciência fonológica em crianças. Inclui atividades de rima, segmentação e manipulação de sons.',
    type: 'WORKSHEET',
    category: 'Consciência Fonológica',
    ageGroup: '4-8 anos',
    fileSize: '2.8 MB',
    downloadCount: 934,
    viewCount: 1800,
    rating: 4.7,
    tags: ['consciência-fonológica', 'rimas', 'segmentação', 'manipulação'],
    downloadUrl: '/api/resources/download/7',
    viewUrl: '/recursos/consciencia-fonologica',
    thumbnailUrl: '/images/resources/consciencia-thumb.jpg',
    isFree: true,
    isFeatured: false,
  },
  {
    title: 'Guia de Estratégias para Gagueira',
    description:
      'Técnicas e estratégias para trabalhar com crianças que apresentam gagueira. Inclui exercícios de fluência e relaxamento.',
    type: 'GUIDE',
    category: 'Fluência',
    ageGroup: '3-12 anos',
    fileSize: '3.5 MB',
    downloadCount: 567,
    viewCount: 950,
    rating: 4.8,
    tags: ['gagueira', 'fluência', 'relaxamento', 'técnicas'],
    downloadUrl: '/api/resources/download/8',
    viewUrl: '/recursos/estrategias-gagueira',
    thumbnailUrl: '/images/resources/gagueira-thumb.jpg',
    isFree: false,
    isFeatured: false,
  },
];

const initialCategories = [
  {
    name: 'Fonemas',
    description: 'Exercícios para desenvolvimento de fonemas específicos',
    color: '#3B82F6',
    icon: 'Volume2',
  },
  {
    name: 'Respiração',
    description: 'Técnicas e exercícios respiratórios',
    color: '#10B981',
    icon: 'Wind',
  },
  {
    name: 'Audição',
    description: 'Treino auditivo e discriminação de sons',
    color: '#F59E0B',
    icon: 'Headphones',
  },
  {
    name: 'TEA',
    description: 'Recursos especializados para TEA',
    color: '#8B5CF6',
    icon: 'Heart',
  },
  {
    name: 'Motricidade',
    description: 'Exercícios de motricidade orofacial',
    color: '#EF4444',
    icon: 'Activity',
  },
  {
    name: 'Consciência Fonológica',
    description: 'Desenvolvimento da consciência fonológica',
    color: '#06B6D4',
    icon: 'BookOpen',
  },
  {
    name: 'Fluência',
    description: 'Estratégias para desenvolvimento da fluência',
    color: '#84CC16',
    icon: 'Zap',
  },
];

async function seedResources() {
  try {
    console.log('🌱 Starting resource seeding...');

    // Create categories first
    console.log('📁 Creating categories...');
    for (const category of initialCategories) {
      await prisma.resourceCategory.upsert({
        where: { name: category.name },
        update: category,
        create: category,
      });
    }

    // Create resources
    console.log('📚 Creating resources...');
    for (const resource of initialResources) {
      await prisma.resource.create({
        data: resource,
      });
    }

    console.log('✅ Resource seeding completed successfully!');
    console.log(
      `📊 Created ${initialCategories.length} categories and ${initialResources.length} resources`
    );
  } catch (error) {
    console.error('❌ Error seeding resources:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedResources()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedResources;
