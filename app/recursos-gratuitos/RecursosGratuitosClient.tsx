'use client';

import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface FreeResource {
  id: string;
  title: string;
  description: string;
  category: string;
  ageGroup: string;
  downloadCount: number;
  rating: number;
  tags: string[];
  downloadUrl: string;
  thumbnailUrl?: string;
  fileSize: string;
  createdAt: string;
  isFeatured: boolean;
  content: string; // Markdown content to display
}

// Sample free PDF resources
const FREE_RESOURCES: FreeResource[] = [
  {
    id: '1',
    title: 'Guia Completo de Exercícios para Desenvolvimento da Fala',
    description:
      'Manual abrangente com 50+ exercícios práticos para diferentes faixas etárias e níveis de desenvolvimento da fala.',
    category: 'Exercícios',
    ageGroup: '2-12 anos',
    downloadCount: 1250,
    rating: 4.8,
    tags: ['exercícios', 'desenvolvimento', 'crianças', 'fala'],
    downloadUrl: '/pdfs/guia-exercicios-desenvolvimento-fala.pdf',
    fileSize: '2.3 MB',
    createdAt: '2024-01-15',
    isFeatured: true,
    content: `# Guia Completo de Exercícios para Desenvolvimento da Fala

## Introdução

Este guia apresenta exercícios práticos e eficazes para o desenvolvimento da fala em crianças de diferentes faixas etárias. Os exercícios foram desenvolvidos por fonoaudiólogos especialistas e são baseados em evidências científicas.

## Exercícios para Crianças de 2-4 anos

### 1. Exercícios de Respiração
- **Soprar bolinhas de sabão**: Desenvolve controle respiratório
- **Soprar apitos**: Fortalece a musculatura oral
- **Fazer "voz de motor"**: Melhora a coordenação pneumofonoarticulatória

### 2. Exercícios de Motricidade Oral
- **Movimentos de língua**: Para cima, para baixo, lateralmente
- **Movimentos de lábios**: Sorriso, bico, vibração
- **Movimentos de bochechas**: Inflar e esvaziar

### 3. Exercícios de Imitação
- **Sons de animais**: Miau, au-au, cocoricó
- **Sons de veículos**: Vrum, pi-pi, chuá-chuá
- **Sons ambientais**: Água caindo, vento, chuva

## Exercícios para Crianças de 4-6 anos

### 1. Consciência Fonológica
- **Rimas**: Encontrar palavras que rimam
- **Aliteração**: Palavras que começam com o mesmo som
- **Segmentação silábica**: Bater palmas para cada sílaba

### 2. Articulação
- **Fonemas bilabiais**: /p/, /b/, /m/
- **Fonemas dentais**: /t/, /d/, /n/
- **Fonemas velares**: /k/, /g/

## Exercícios para Crianças de 6-12 anos

### 1. Fonemas Líquidos
- **Exercícios para /l/**: Lala, lele, lili, lolo, lulu
- **Exercícios para /r/**: Rara, rere, riri, roro, ruru
- **Trabalho com palavras**: Laranja, carro, flor, prato

### 2. Consciência Fonêmica
- **Identificação de fonemas**: Qual som você ouve no início?
- **Substituição de fonemas**: Trocar /p/ por /b/ em "pato"
- **Deleção de fonemas**: Dizer "casa" sem o /k/

## Dicas Importantes

1. **Paciência**: Cada criança tem seu ritmo de desenvolvimento
2. **Consistência**: Praticar diariamente por 10-15 minutos
3. **Ludicidade**: Tornar os exercícios divertidos e interessantes
4. **Reforço positivo**: Elogiar sempre os esforços da criança
5. **Profissional**: Consultar um fonoaudiólogo se necessário

## Conclusão

Estes exercícios são ferramentas valiosas para o desenvolvimento da fala, mas não substituem a avaliação e acompanhamento de um profissional especializado.`,
  },
  {
    id: '2',
    title: 'Planilha de Avaliação Fonológica',
    description:
      'Formulário estruturado para avaliação sistemática dos fonemas e desenvolvimento fonológico.',
    category: 'Avaliação',
    ageGroup: '3-8 anos',
    downloadCount: 980,
    rating: 4.7,
    tags: ['avaliação', 'fonologia', 'planilha', 'diagnóstico'],
    downloadUrl: '/pdfs/planilha-avaliacao-fonologica.pdf',
    fileSize: '1.8 MB',
    createdAt: '2024-01-10',
    isFeatured: true,
    content: `# Planilha de Avaliação Fonológica

## Dados da Criança
- **Nome**: ________________
- **Idade**: ________________
- **Data de Nascimento**: ________________
- **Data da Avaliação**: ________________
- **Avaliador**: ________________

## Inventário Fonético

### Fonemas Oclusivos
| Fonema | Posição Inicial | Posição Medial | Posição Final | Observações |
|--------|----------------|----------------|---------------|-------------|
| /p/    | [ ]            | [ ]            | [ ]           |             |
| /b/    | [ ]            | [ ]            | [ ]           |             |
| /t/    | [ ]            | [ ]            | [ ]           |             |
| /d/    | [ ]            | [ ]            | [ ]           |             |
| /k/    | [ ]            | [ ]            | [ ]           |             |
| /g/    | [ ]            | [ ]            | [ ]           |             |

### Fonemas Fricativos
| Fonema | Posição Inicial | Posição Medial | Posição Final | Observações |
|--------|----------------|----------------|---------------|-------------|
| /f/    | [ ]            | [ ]            | [ ]           |             |
| /v/    | [ ]            | [ ]            | [ ]           |             |
| /s/    | [ ]            | [ ]            | [ ]           |             |
| /z/    | [ ]            | [ ]            | [ ]           |             |
| /ʃ/    | [ ]            | [ ]            | [ ]           |             |
| /ʒ/    | [ ]            | [ ]            | [ ]           |             |

### Fonemas Líquidos
| Fonema | Posição Inicial | Posição Medial | Posição Final | Observações |
|--------|----------------|----------------|---------------|-------------|
| /l/    | [ ]            | [ ]            | [ ]           |             |
| /r/    | [ ]            | [ ]            | [ ]           |             |
| /ɾ/    | [ ]            | [ ]            | [ ]           |             |

### Fonemas Nasais
| Fonema | Posição Inicial | Posição Medial | Posição Final | Observações |
|--------|----------------|----------------|---------------|-------------|
| /m/    | [ ]            | [ ]            | [ ]           |             |
| /n/    | [ ]            | [ ]            | [ ]           |             |
| /ɲ/    | [ ]            | [ ]            | [ ]           |             |

## Processos Fonológicos Identificados

### Processos de Substituição
- [ ] Substituição de líquidos
- [ ] Substituição de fricativos
- [ ] Substituição de oclusivos
- [ ] Substituição de nasais

### Processos de Omissão
- [ ] Omissão de consoante final
- [ ] Omissão de consoante medial
- [ ] Omissão de sílaba átona

### Processos de Assimilação
- [ ] Assimilação de lugar
- [ ] Assimilação de modo
- [ ] Assimilação de sonoridade

## Análise Quantitativa

- **Total de fonemas produzidos**: _____/_____
- **Percentual de consoantes corretas (PCC)**: _____%
- **Processos fonológicos ativos**: _____

## Recomendações

1. **Intervenção necessária**: [ ] Sim [ ] Não
2. **Frequência sugerida**: ________________
3. **Objetivos prioritários**: ________________
4. **Observações gerais**: ________________`,
  },
  {
    id: '3',
    title: 'Exercícios para Fonemas Líquidos (L e R)',
    description:
      'Atividades específicas para trabalhar os fonemas líquidos, com progressão de dificuldade.',
    category: 'Exercícios',
    ageGroup: '4-10 anos',
    downloadCount: 750,
    rating: 4.6,
    tags: ['líquidos', 'fonemas', 'exercícios', 'articulação'],
    downloadUrl: '/pdfs/exercicios-fonemas-liquidos.pdf',
    fileSize: '1.5 MB',
    createdAt: '2024-01-08',
    isFeatured: false,
    content: `# Exercícios para Fonemas Líquidos (L e R)

## Introdução

Os fonemas líquidos /l/ e /r/ são frequentemente os mais difíceis para as crianças adquirirem. Este guia apresenta exercícios progressivos para trabalhar esses fonemas.

## Exercícios para o Fonema /l/

### Nível 1: Isolado
- **Lala**: Repetir "la-la-la" várias vezes
- **Lele**: Repetir "le-le-le" várias vezes
- **Lili**: Repetir "li-li-li" várias vezes
- **Lolo**: Repetir "lo-lo-lo" várias vezes
- **Lulu**: Repetir "lu-lu-lu" várias vezes

### Nível 2: Sílabas
- **LA**: la, le, li, lo, lu
- **AL**: al, el, il, ol, ul
- **CLA**: cla, cle, cli, clo, clu
- **FLA**: fla, fle, fli, flo, flu

### Nível 3: Palavras
- **Posição inicial**: lua, lápis, livro, laranja, leão
- **Posição medial**: bola, gato, cola, fila, mala
- **Posição final**: sal, mel, sol, papel, anel

### Nível 4: Frases
- "A lua está bonita"
- "O leão come carne"
- "A laranja é doce"
- "O livro é grande"

## Exercícios para o Fonema /r/

### Nível 1: Vibração
- **Rrrr**: Fazer som de motor
- **Rrrr**: Fazer som de cachorro
- **Rrrr**: Fazer som de leão

### Nível 2: Sílabas
- **RA**: ra, re, ri, ro, ru
- **AR**: ar, er, ir, or, ur
- **TRA**: tra, tre, tri, tro, tru
- **BRA**: bra, bre, bri, bro, bru

### Nível 3: Palavras
- **Posição inicial**: rato, rosa, roda, rua, rei
- **Posição medial**: carro, ferro, terra, barco, perto
- **Posição final**: mar, cor, dor, ar, ir

### Nível 4: Frases
- "O rato come queijo"
- "A rosa é vermelha"
- "O carro é azul"
- "A terra é marrom"

## Dicas Importantes

1. **Posição da língua**: Para /l/, a língua toca o céu da boca
2. **Vibração**: Para /r/, a língua vibra no céu da boca
3. **Paciência**: Cada criança tem seu ritmo
4. **Prática diária**: 10-15 minutos por dia
5. **Reforço positivo**: Elogiar sempre os esforços`,
  },
  {
    id: '4',
    title: 'Manual de Estimulação Precoce da Linguagem',
    description:
      'Guia prático para estimular o desenvolvimento da linguagem em bebês e crianças pequenas.',
    category: 'Estimulação',
    ageGroup: '0-3 anos',
    downloadCount: 650,
    rating: 4.9,
    tags: ['estimulação', 'bebês', 'linguagem', 'precoce'],
    downloadUrl: '/pdfs/manual-estimulacao-precoce.pdf',
    fileSize: '2.1 MB',
    createdAt: '2024-01-05',
    isFeatured: true,
    content: `# Manual de Estimulação Precoce da Linguagem

## Introdução

A estimulação precoce da linguagem é fundamental para o desenvolvimento saudável da criança. Este manual apresenta estratégias práticas para pais e cuidadores.

## 0-6 meses

### Estratégias de Estimulação
- **Fale com o bebê**: Converse durante as atividades diárias
- **Cante canções**: Use melodias simples e repetitivas
- **Imitação**: Repita os sons que o bebê produz
- **Contato visual**: Mantenha olho no olho durante a interação

### Atividades Recomendadas
- **Hora do banho**: Descreva o que está fazendo
- **Hora da alimentação**: Fale sobre os alimentos
- **Hora de dormir**: Cante canções de ninar
- **Hora de brincar**: Use brinquedos com sons

## 6-12 meses

### Estratégias de Estimulação
- **Apontar e nomear**: Aponte objetos e diga seus nomes
- **Gestos**: Use gestos simples como "tchau" e "não"
- **Imitação de sons**: Repita sons de animais e veículos
- **Jogos interativos**: Brinque de esconder e aparecer

### Atividades Recomendadas
- **Leitura de livros**: Use livros com imagens grandes
- **Brincadeiras com espelho**: Faça caretas e sons
- **Música e dança**: Cante e dance com o bebê
- **Exploração tátil**: Deixe o bebê tocar diferentes texturas

## 12-24 meses

### Estratégias de Estimulação
- **Expansão de vocabulário**: Adicione palavras às frases da criança
- **Perguntas simples**: Faça perguntas que a criança possa responder
- **Rotinas**: Estabeleça rotinas com linguagem consistente
- **Brincadeiras simbólicas**: Use brinquedos para representar situações

### Atividades Recomendadas
- **Brincadeiras de faz-de-conta**: Cozinha, médico, escola
- **Jogos de classificação**: Agrupar objetos por cor, forma, tamanho
- **Histórias simples**: Conte histórias com poucos personagens
- **Música e movimento**: Cante e dance juntos

## 24-36 meses

### Estratégias de Estimulação
- **Conversas mais complexas**: Faça perguntas abertas
- **Explicações**: Explique o "porquê" das coisas
- **Leitura interativa**: Faça perguntas sobre as histórias
- **Jogos de linguagem**: Rimas, adivinhas, trava-línguas

### Atividades Recomendadas
- **Teatro de fantoches**: Crie histórias com bonecos
- **Jogos de memória**: Use cartas com imagens
- **Culinária**: Cozinhe juntos e descreva o processo
- **Passeios educativos**: Visite parques, zoológicos, museus

## Sinais de Alerta

### Procure um fonoaudiólogo se a criança:
- Não reage a sons aos 6 meses
- Não produz sons aos 12 meses
- Não fala palavras aos 18 meses
- Não forma frases aos 24 meses
- Não é compreendida por estranhos aos 36 meses

## Dicas Gerais

1. **Seja paciente**: Cada criança tem seu ritmo
2. **Seja consistente**: Mantenha as rotinas
3. **Seja criativo**: Use a imaginação
4. **Seja presente**: Dedique tempo de qualidade
5. **Seja observador**: Note os interesses da criança`,
  },
  {
    id: '5',
    title: 'Atividades para Consciência Fonológica',
    description:
      'Exercícios lúdicos para desenvolver a consciência fonológica em crianças em idade pré-escolar.',
    category: 'Consciência Fonológica',
    ageGroup: '3-6 anos',
    downloadCount: 580,
    rating: 4.5,
    tags: ['consciência fonológica', 'pré-escola', 'alfabetização'],
    downloadUrl: '/pdfs/atividades-consciencia-fonologica.pdf',
    fileSize: '1.9 MB',
    createdAt: '2024-01-03',
    isFeatured: false,
    content: `# Atividades para Consciência Fonológica

## Introdução

A consciência fonológica é a capacidade de reconhecer e manipular os sons da fala. É fundamental para o aprendizado da leitura e escrita.

## Atividades de Rima

### 1. Jogo das Rimas
- **Objetivo**: Encontrar palavras que rimam
- **Material**: Cartas com imagens
- **Como jogar**: Mostre uma carta e peça para a criança encontrar outra que rime

### 2. Poemas e Cantigas
- **Objetivo**: Identificar rimas em textos
- **Material**: Livros de poesia infantil
- **Como fazer**: Leia poemas e destaque as palavras que rimam

### 3. Criação de Rimas
- **Objetivo**: Criar palavras que rimam
- **Material**: Nenhum
- **Como fazer**: Dê uma palavra e peça para a criança criar uma que rime

## Atividades de Aliteração

### 1. Jogo do Som Inicial
- **Objetivo**: Identificar o som inicial das palavras
- **Material**: Objetos diversos
- **Como jogar**: Peça para a criança agrupar objetos que começam com o mesmo som

### 2. Trava-línguas
- **Objetivo**: Trabalhar sons específicos
- **Material**: Lista de trava-línguas
- **Como fazer**: Pratique trava-línguas com sons específicos

### 3. Histórias com Aliteração
- **Objetivo**: Identificar repetição de sons
- **Material**: Livros com aliteração
- **Como fazer**: Leia histórias e destaque as repetições de sons

## Atividades de Segmentação Silábica

### 1. Bater Palmas
- **Objetivo**: Segmentar palavras em sílabas
- **Material**: Nenhum
- **Como fazer**: Bata palmas para cada sílaba das palavras

### 2. Jogo das Sílabas
- **Objetivo**: Contar sílabas
- **Material**: Cartas com imagens
- **Como jogar**: Mostre uma carta e peça para a criança contar as sílabas

### 3. Construção de Palavras
- **Objetivo**: Juntar sílabas para formar palavras
- **Material**: Cartões com sílabas
- **Como jogar**: Dê sílabas para a criança formar palavras

## Atividades de Consciência Fonêmica

### 1. Identificação de Fonemas
- **Objetivo**: Identificar fonemas em palavras
- **Material**: Objetos diversos
- **Como fazer**: Peça para a criança identificar o primeiro, meio ou último som

### 2. Substituição de Fonemas
- **Objetivo**: Trocar fonemas em palavras
- **Material**: Nenhum
- **Como fazer**: Dê uma palavra e peça para trocar um som

### 3. Deleção de Fonemas
- **Objetivo**: Remover fonemas de palavras
- **Material**: Nenhum
- **Como fazer**: Dê uma palavra e peça para remover um som

## Dicas Importantes

1. **Comece simples**: Inicie com atividades mais fáceis
2. **Seja consistente**: Pratique regularmente
3. **Torne divertido**: Use jogos e brincadeiras
4. **Seja paciente**: Cada criança tem seu ritmo
5. **Celebre o progresso**: Elogie os acertos`,
  },
  {
    id: '6',
    title: 'Protocolo de Avaliação de Fluência',
    description:
      'Instrumento padronizado para avaliação da fluência da fala e identificação de gagueira.',
    category: 'Avaliação',
    ageGroup: '4-12 anos',
    downloadCount: 420,
    rating: 4.7,
    tags: ['fluência', 'gagueira', 'avaliação', 'protocolo'],
    downloadUrl: '/pdfs/protocolo-avaliacao-fluencia.pdf',
    fileSize: '1.2 MB',
    createdAt: '2024-01-01',
    isFeatured: false,
    content: `# Protocolo de Avaliação de Fluência

## Dados da Criança
- **Nome**: ________________
- **Idade**: ________________
- **Data de Nascimento**: ________________
- **Data da Avaliação**: ________________
- **Avaliador**: ________________

## Anamnese

### História Familiar
- [ ] Histórico familiar de gagueira
- [ ] Outros problemas de fala na família
- [ ] Observações: ________________

### Desenvolvimento da Fala
- **Idade das primeiras palavras**: ________________
- **Idade das primeiras frases**: ________________
- **Problemas anteriores de fala**: ________________
- **Tratamentos anteriores**: ________________

### Início da Gagueira
- **Idade de início**: ________________
- **Como começou**: ________________
- **Evolução**: ________________
- **Fatores desencadeantes**: ________________

## Avaliação da Fluência

### Tarefas de Fala
1. **Conversa espontânea** (5 minutos)
   - Observações: ________________
   - Disfluências observadas: ________________

2. **Leitura** (se aplicável)
   - Texto utilizado: ________________
   - Observações: ________________

3. **Narração de história**
   - Material utilizado: ________________
   - Observações: ________________

### Tipos de Disfluências

#### Disfluências Típicas
- [ ] Repetições de palavras inteiras
- [ ] Repetições de frases
- [ ] Revisões
- [ ] Interjeições

#### Disfluências Atípicas
- [ ] Repetições de sons
- [ ] Repetições de sílabas
- [ ] Prolongamentos
- [ ] Bloqueios
- [ ] Tensão muscular
- [ ] Movimentos associados

### Frequência de Disfluências
- **Total de palavras**: ________________
- **Total de disfluências**: ________________
- **Percentual de disfluências**: ________________%

### Severidade
- [ ] Muito leve (1)
- [ ] Leve (2)
- [ ] Moderada (3)
- [ ] Severa (4)
- [ ] Muito severa (5)

## Comportamentos Associados

### Comportamentos Primários
- [ ] Tensão muscular
- [ ] Movimentos faciais
- [ ] Movimentos corporais
- [ ] Respiração alterada

### Comportamentos Secundários
- [ ] Evitação de palavras
- [ ] Evitação de situações
- [ ] Uso de muletas verbais
- [ ] Ansiedade ao falar

## Impacto na Vida da Criança

### Comunicação
- [ ] Dificuldade para se expressar
- [ ] Evitação de situações de fala
- [ ] Frustração ao falar
- [ ] Isolamento social

### Escola
- [ ] Dificuldade na participação oral
- [ ] Evitação de apresentações
- [ ] Problemas com colegas
- [ ] Rendimento escolar afetado

## Recomendações

### Intervenção Imediata
- [ ] Sim
- [ ] Não
- **Justificativa**: ________________

### Tipo de Intervenção
- [ ] Terapia individual
- [ ] Terapia em grupo
- [ ] Orientação familiar
- [ ] Orientação escolar

### Frequência Sugerida
- [ ] 1x por semana
- [ ] 2x por semana
- [ ] 3x por semana
- [ ] Outro: ________________

### Objetivos Prioritários
1. ________________
2. ________________
3. ________________

## Observações Finais

### Pontos Fortes
- ________________
- ________________
- ________________

### Áreas de Dificuldade
- ________________
- ________________
- ________________

### Recomendações Específicas
- ________________
- ________________
- ________________`,
  },
];

const CATEGORIES = [
  'Todos',
  'Exercícios',
  'Avaliação',
  'Estimulação',
  'Consciência Fonológica',
  'Fonemas',
  'Fluência',
];

const AGE_GROUPS = [
  'Todas as idades',
  '0-3 anos',
  '3-6 anos',
  '4-8 anos',
  '6-12 anos',
];

export default function RecursosGratuitosClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('Todas as idades');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedResource, setSelectedResource] = useState<FreeResource | null>(
    null
  );

  const filteredResources = FREE_RESOURCES.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'Todos' || resource.category === selectedCategory;
    const matchesAgeGroup =
      selectedAgeGroup === 'Todas as idades' ||
      resource.ageGroup === selectedAgeGroup;

    return matchesSearch && matchesCategory && matchesAgeGroup;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloadCount - a.downloadCount;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const featuredResources = FREE_RESOURCES.filter((r) => r.isFeatured);

  const handleDownload = (resource: FreeResource) => {
    // In a real app, this would track downloads and handle the actual download
    console.log('Downloading:', resource.title);
    // For now, we'll just show an alert
    alert(`Download iniciado: ${resource.title}`);
  };

  const handleViewContent = (resource: FreeResource) => {
    setSelectedResource(resource);
  };

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Recursos Gratuitos de Fonoaudiologia',
    description:
      'Baixe gratuitamente exercícios de fonoaudiologia, planilhas de avaliação e materiais didáticos para fonoaudiólogos.',
    url: 'https://www.almanaquedafala.com.br/recursos-gratuitos',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: FREE_RESOURCES.map((resource, index) => ({
        '@type': 'CreativeWork',
        position: index + 1,
        name: resource.title,
        description: resource.description,
        url: `https://www.almanaquedafala.com.br/recursos-gratuitos#${resource.id}`,
        author: {
          '@type': 'Organization',
          name: 'Almanaque da Fala',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Almanaque da Fala',
        },
        datePublished: resource.createdAt,
        fileFormat: 'application/pdf',
        contentSize: resource.fileSize,
        keywords: resource.tags.join(', '),
        audience: {
          '@type': 'Audience',
          audienceType: 'Fonoaudiólogos',
        },
      })),
    },
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Shared Navbar */}
        <SharedNavbar />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100 pt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Breadcrumbs
              items={[
                { name: 'Home', href: '/' },
                { name: 'Recursos Gratuitos', href: '/recursos-gratuitos' },
              ]}
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-yellow-50 pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <span className="inline-block px-3 py-1.5 mb-4 sm:mb-6 text-xs sm:text-sm font-medium rounded-full bg-pink-100 text-pink-600">
                  Recursos Gratuitos
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
                  Recursos Gratuitos de Fonoaudiologia
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-3xl mx-auto px-2">
                  Baixe gratuitamente exercícios, planilhas de avaliação e
                  materiais didáticos desenvolvidos por especialistas em
                  fonoaudiologia para terapia da fala.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
                <div className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-600">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>6+ Recursos PDF</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-600">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>4.6k+ Downloads</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-600">
                  <Star className="w-4 h-4" aria-hidden="true" />
                  <span>Avaliação 4.7/5</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Featured Resources */}
            {featuredResources.length > 0 && (
              <section className="mb-12" aria-labelledby="featured-resources">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-pink-500 rounded-full"></div>
                  <h2
                    id="featured-resources"
                    className="text-2xl font-bold text-gray-900"
                  >
                    Recursos em Destaque para Fonoaudiólogos
                  </h2>
                </div>
                <p className="text-gray-600 mb-8 max-w-3xl">
                  Nossos materiais mais populares e recomendados para terapia da
                  fala, desenvolvimento da linguagem e avaliação
                  fonoaudiológica.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredResources.map((resource) => (
                    <article
                      key={resource.id}
                      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-pink-200 flex flex-col h-full"
                      itemScope
                      itemType="https://schema.org/CreativeWork"
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3
                              className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors"
                              itemProp="name"
                            >
                              {resource.title}
                            </h3>
                            <p
                              className="text-gray-600 text-sm mb-4 leading-relaxed min-h-[3.5rem]"
                              itemProp="description"
                            >
                              {resource.description}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-600 ml-2">
                            <Star className="w-3 h-3 mr-1" />
                            Destaque
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.category}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.ageGroup}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 min-h-[1.5rem]">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {resource.downloadCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {resource.rating}
                          </span>
                          <span>{resource.fileSize}</span>
                        </div>

                        <div className="flex gap-2 w-full mt-auto">
                          <Button
                            onClick={() => handleViewContent(resource)}
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Conteúdo
                          </Button>
                          <Button
                            onClick={() => handleDownload(resource)}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PDF
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Filters */}
            <div className="mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar recursos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faixa Etária
                    </label>
                    <select
                      value={selectedAgeGroup}
                      onChange={(e) => setSelectedAgeGroup(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      {AGE_GROUPS.map((ageGroup) => (
                        <option key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="popular">Mais Baixados</option>
                      <option value="rating">Melhor Avaliados</option>
                      <option value="newest">Mais Recentes</option>
                      <option value="alphabetical">A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <section aria-labelledby="all-resources">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-pink-500 rounded-full"></div>
                <h2
                  id="all-resources"
                  className="text-2xl font-bold text-gray-900"
                >
                  Biblioteca Completa de Recursos Fonoaudiológicos (
                  {sortedResources.length})
                </h2>
              </div>
              <p className="text-gray-600 mb-8 max-w-3xl">
                Explore nossa coleção completa de materiais para fonoaudiologia,
                incluindo exercícios terapêuticos, protocolos de avaliação e
                guias de desenvolvimento da linguagem.
              </p>

              {sortedResources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum recurso encontrado
                  </h3>
                  <p className="text-gray-500">
                    Tente ajustar os filtros para encontrar o que procura.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedResources.map((resource) => (
                    <article
                      key={resource.id}
                      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-pink-200 flex flex-col h-full"
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                              {resource.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed min-h-[3.5rem]">
                              {resource.description}
                            </p>
                          </div>
                          {resource.isFeatured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-600 ml-2">
                              <Star className="w-3 h-3 mr-1" />
                              Destaque
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.category}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.ageGroup}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 min-h-[1.5rem]">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {resource.downloadCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {resource.rating}
                          </span>
                          <span>{resource.fileSize}</span>
                        </div>

                        <div className="flex gap-2 w-full mt-auto">
                          <Button
                            onClick={() => handleViewContent(resource)}
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Conteúdo
                          </Button>
                          <Button
                            onClick={() => handleDownload(resource)}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PDF
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl p-8 text-center text-white mt-16">
          <h2 className="text-2xl font-bold mb-4">
            Quer Acesso a Mais Recursos?
          </h2>
          <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
            Junte-se à nossa plataforma e tenha acesso a centenas de exercícios,
            planilhas de avaliação e ferramentas profissionais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-pink-600 hover:bg-gray-50"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explorar Plataforma
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-pink-600"
            >
              <Users className="w-5 h-5 mr-2" />
              Ver Comunidade
            </Button>
          </div>
        </div>

        {/* Content Modal */}
        <Dialog
          open={!!selectedResource}
          onOpenChange={() => setSelectedResource(null)}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
            <DialogHeader className="flex-shrink-0 border-b border-gray-200 pb-4">
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                {selectedResource?.title}
              </DialogTitle>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <FileText className="w-4 h-4" />
                  {selectedResource?.category}
                </span>
                <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <Star className="w-4 h-4" />
                  {selectedResource?.ageGroup}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  {selectedResource?.fileSize}
                </span>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedResource && (
                <div
                  className="prose prose-lg max-w-none 
                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:border-b prose-h1:border-pink-200 prose-h1:pb-3
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-gray-800
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:marker:text-pink-500
                prose-li:text-gray-700 prose-li:leading-relaxed prose-li:mb-1"
                >
                  {selectedResource.content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedResource.content
                          .replace(
                            /^# (.*$)/gim,
                            '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8 border-b border-pink-200 pb-3">$1</h1>'
                          )
                          .replace(
                            /^## (.*$)/gim,
                            '<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8 border-b border-gray-200 pb-2">$1</h2>'
                          )
                          .replace(
                            /^### (.*$)/gim,
                            '<h3 class="text-xl font-medium text-gray-800 mb-3 mt-6">$1</h3>'
                          )
                          .replace(
                            /^- (.*$)/gim,
                            '<li class="text-gray-700 leading-relaxed mb-1">$1</li>'
                          )
                          .replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong class="font-semibold text-gray-900">$1</strong>'
                          )
                          // Handle tables
                          .replace(
                            /\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/g,
                            (match, header, rows) => {
                              const headerCells = header
                                .split('|')
                                .filter((cell: string) => cell.trim())
                                .map(
                                  (cell: string) =>
                                    `<th class="px-4 py-3 bg-gray-100 text-left text-sm font-medium text-gray-900 border border-gray-200">${cell.trim()}</th>`
                                )
                                .join('');

                              const tableRows = rows
                                .trim()
                                .split('\n')
                                .filter((row: string) => row.trim())
                                .map((row: string) => {
                                  const cells = row
                                    .split('|')
                                    .filter((cell: string) => cell.trim())
                                    .map((cell: string) => {
                                      const cellContent = cell.trim();
                                      // Replace [] with empty space or dash
                                      const cleanContent =
                                        cellContent === '[]'
                                          ? '—'
                                          : cellContent;
                                      return `<td class="px-4 py-3 border border-gray-200 text-sm text-gray-700">${cleanContent}</td>`;
                                    })
                                    .join('');
                                  return `<tr>${cells}</tr>`;
                                })
                                .join('');

                              return `<div class="overflow-x-auto my-6"><table class="min-w-full border border-gray-200 rounded-lg"><thead><tr>${headerCells}</tr></thead><tbody>${tableRows}</tbody></table></div>`;
                            }
                          )
                          .replace(
                            /\n\n/g,
                            '</p><p class="text-gray-700 leading-relaxed mb-4">'
                          )
                          .replace(
                            /^(?!<[h|l]|<div|<table)/gm,
                            '<p class="text-gray-700 leading-relaxed mb-4">'
                          )
                          .replace(
                            /<p class="text-gray-700 leading-relaxed mb-4"><\/p>/g,
                            ''
                          ),
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 italic text-center py-8">
                      Conteúdo não disponível
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                {selectedResource?.downloadCount} downloads • Avaliação{' '}
                {selectedResource?.rating}/5
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    selectedResource && handleDownload(selectedResource)
                  }
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedResource(null)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <LandingFooter />
    </>
  );
}
