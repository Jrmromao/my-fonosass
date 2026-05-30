#!/bin/bash
# Seed FonoSaaS dev database using Prisma (handles enums correctly)
set -e

echo "Seeding FonoSaaS dev database..."

npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // Upsert user
  const user = await prisma.user.upsert({
    where: { clerkUserId: 'user_2wgHjiDvwdDOUgxT4IqFrGvMuLb' },
    update: { role: 'ADMIN' },
    create: {
      email: 'jrmromao@gmail.com',
      fullName: 'João Filipe Romão',
      clerkUserId: 'user_2wgHjiDvwdDOUgxT4IqFrGvMuLb',
      role: 'ADMIN',
    },
  });

  // Download limit
  await prisma.downloadLimit.upsert({
    where: { userId: user.id },
    update: { downloads: 1 },
    create: { userId: user.id, downloads: 1 },
  });

  // Activities
  const phonemes = ['P','B','T','D','K','G','F','V','S','Z','R','L','CH','J','M','N'];
  const types = ['SPEECH','LANGUAGE','COGNITIVE'];
  const diffs = ['BEGINNER','INTERMEDIATE','ADVANCED'];
  const ages = ['PRESCHOOL','CHILD','TEENAGER'];
  const themes = ['Animais','Comida','Transporte','Escola','Natureza','Corpo Humano','Profissões','Brinquedos','Casa','Roupas'];

  let count = 0;
  for (const p of phonemes) {
    for (let i = 0; i < 10; i++) {
      await prisma.activity.upsert({
        where: { id: 'act-' + p + '-' + i },
        update: {},
        create: {
          id: 'act-' + p + '-' + i,
          name: themes[i % 10] + ' (Fonema /' + p + '/)',
          description: 'Exercício de ' + types[i % 3].toLowerCase() + ' com tema ' + themes[i % 10] + ' para fonema /' + p + '/.',
          type: types[i % 3],
          difficulty: diffs[i % 3],
          ageRange: ages[i % 3],
          phoneme: p,
          isPublic: true,
          status: 'PUBLISHED',
          createdById: user.id,
        },
      });
      count++;
    }
  }

  // Pending activities
  for (let i = 1; i <= 5; i++) {
    await prisma.activity.upsert({
      where: { id: 'act-pending-' + i },
      update: {},
      create: {
        id: 'act-pending-' + i,
        name: 'Atividade Pendente ' + i,
        description: JSON.stringify({ titulo: 'Exercício ' + i, objetivo: 'Trabalhar fonema', instrucoes: ['Passo 1', 'Passo 2'] }),
        type: 'SPEECH',
        difficulty: 'BEGINNER',
        ageRange: 'CHILD',
        phoneme: 'R',
        isPublic: false,
        status: 'PENDING_REVIEW',
        createdById: user.id,
      },
    });
  }

  // Download history
  const activities = await prisma.activity.findMany({ take: 5, where: { status: 'PUBLISHED' } });
  for (const act of activities) {
    await prisma.downloadHistory.create({
      data: { userId: user.id, activityId: act.id, fileName: act.name + '.pdf' },
    }).catch(() => {});
  }

  console.log('Seeded: ' + count + ' activities, 5 pending, 5 downloads');
  await prisma.\$disconnect();
}

seed();
"

echo "Done!"
