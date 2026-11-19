import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleExercises = [
  {
    name: 'Exercício de Fonema /P/',
    description:
      'Exercício para trabalhar o fonema /p/ com palavras simples e imagens coloridas. Ideal para crianças em fase de desenvolvimento da fala.',
    type: 'ANIMALS',
    phoneme: 'p',
  },
  {
    name: 'Cores e Sons /K/',
    description:
      'Atividade que combina reconhecimento de cores com a produção do fonema /k/. Inclui exercícios de repetição e identificação.',
    type: 'COLOURS',
    phoneme: 'k',
  },
  {
    name: 'Transporte com /T/',
    description:
      'Exercício avançado para trabalhar o fonema /t/ usando vocabulário de meios de transporte. Inclui frases e contextos variados.',
    type: 'MEANS_OF_TRANSPORT',
    phoneme: 't',
  },
  {
    name: 'Roupas e Fonema /R/',
    description:
      'Atividade especializada para o fonema /r/, um dos mais desafiadores. Usa vocabulário de roupas e acessórios.',
    type: 'CLOTHING',
    phoneme: 'r',
  },
  {
    name: 'Animais da Fazenda /F/',
    description:
      'Exercício lúdico com animais da fazenda para trabalhar o fonema /f/. Inclui sons dos animais e características.',
    type: 'ANIMALS',
    phoneme: 'f',
  },
  {
    name: 'Cores Primárias /S/',
    description:
      'Atividade para desenvolver o fonema /s/ usando cores primárias. Exercícios de discriminação auditiva inclusos.',
    type: 'COLOURS',
    phoneme: 's',
  },
  {
    name: 'Veículos Aéreos /V/',
    description:
      'Exercício especializado para o fonema /v/ com foco em veículos aéreos. Inclui exercícios de sopro e articulação.',
    type: 'MEANS_OF_TRANSPORT',
    phoneme: 'v',
  },
  {
    name: 'Acessórios /L/',
    description:
      'Atividade para trabalhar o fonema /l/ usando acessórios e roupas. Exercícios de posicionamento lingual inclusos.',
    type: 'CLOTHING',
    phoneme: 'l',
  },
  {
    name: 'Animais Selvagens /M/',
    description:
      'Exercício básico para o fonema /m/ com animais selvagens. Ideal para primeiros contatos com terapia da fala.',
    type: 'ANIMALS',
    phoneme: 'm',
  },
  {
    name: 'Arco-íris /N/',
    description:
      'Atividade colorida para trabalhar o fonema /n/ usando o conceito de arco-íris e suas cores.',
    type: 'COLOURS',
    phoneme: 'n',
  },
];

const categories = [
  {
    name: 'Fonemas Básicos',
    description: 'Exercícios para fonemas fundamentais',
  },
  {
    name: 'Vocabulário Temático',
    description: 'Exercícios organizados por temas',
  },
  {
    name: 'Desenvolvimento Infantil',
    description: 'Atividades para diferentes faixas etárias',
  },
  {
    name: 'Articulação Avançada',
    description: 'Exercícios para casos complexos',
  },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Create admin user if doesn't exist
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        clerkUserId: 'seed_admin_user',
        email: 'admin@fonosass.com',
        fullName: 'Administrador Almanaque da Fala',
        role: 'ADMIN',
      },
    });
    console.log('✅ Usuário administrador criado');
  }

  // Create categories
  console.log('📚 Criando categorias...');
  for (const category of categories) {
    await prisma.activityCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log('✅ Categorias criadas');

  // Create exercises
  console.log('🎯 Criando exercícios...');
  for (const exercise of sampleExercises) {
    await prisma.activity.create({
      data: {
        ...exercise,
        type: exercise.type as any,
        createdById: adminUser.id,
        isPublic: true,
      },
    });
  }
  console.log('✅ Exercícios criados');

  console.log('🎉 Seed concluído com sucesso!');
  console.log(
    `📊 Criados: ${sampleExercises.length} exercícios e ${categories.length} categorias`
  );
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
