import { PrismaClient, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

const initialResources = [
  {
    title: 'Kit Completo de Exercícios para Desenvolvimento do /R/',
    description:
      'Coleção de 25 exercícios práticos com ilustrações para trabalhar o fonema /r/ em diferentes posições. Inclui atividades lúdicas e progressivas.',
    content: `# Kit Completo de Exercícios para Desenvolvimento do /R/

## 🎯 Introdução

Este kit foi desenvolvido especialmente para fonoaudiólogos trabalharem o fonema /r/ com crianças de 4 a 6 anos. Os exercícios são progressivos e incluem atividades lúdicas que facilitam o aprendizado, baseados nas mais recentes evidências científicas em fonoaudiologia.

## 📋 Objetivos Terapêuticos

- **Desenvolver a articulação do fonema /r/** em todas as posições
- **Melhorar a discriminação auditiva** e consciência fonológica
- **Fortalecer a musculatura orofacial** necessária para a produção do /r/
- **Aumentar a confiança da criança** através de atividades motivadoras
- **Estabelecer automatização** do fonema em fala espontânea

## 🚀 Exercícios Básicos

### 1. Vibração da Língua
- **Objetivo**: Desenvolver a vibração da língua
- **Como fazer**: Peça para a criança fazer "rrrr" como um motor
- **Duração**: 2-3 minutos
- **Frequência**: Diária
- **Dica**: Use espelhos para visualização

### 2. Sons de Animais
- **Objetivo**: Associar o som /r/ a contextos familiares
- **Atividades**:
  - Cachorro: "au au" + "rrrr"
  - Leão: "rrrr" forte
  - Gato: "rrrr" suave
  - Cavalo: "rrrr" galopando

### 3. Palavras com /R/
- **Posição inicial**: rato, rosa, roda, rei, rua, rir
- **Posição medial**: carro, ferro, terra, barco, garra, corra
- **Posição final**: mar, cor, dor, ar, falar, andar

## 🎮 Exercícios Avançados

### 1. Frases Simples
- "O rato come queijo"
- "A rosa é vermelha"
- "O carro é azul"
- "Eu gosto de correr"

### 2. Trava-línguas
- "O rato roeu a roupa do rei de Roma"
- "Três pratos de trigo para três tigres tristes"
- "O rato roeu a roupa do rei de Roma"

### 3. Jogos Interativos
- **Jogo da Memória**: Cartas com palavras contendo /r/
- **Bingo Fonético**: Marcar palavras com /r/ ouvidas
- **Histórias**: Criar narrativas usando palavras-alvo

## 💡 Dicas Importantes

1. **Paciência**: Cada criança tem seu ritmo único de desenvolvimento
2. **Consistência**: Praticar diariamente por 15-20 minutos
3. **Ludicidade**: Tornar os exercícios divertidos e motivadores
4. **Reforço positivo**: Elogiar sempre os esforços e progressos
5. **Profissional**: Consultar um fonoaudiólogo para acompanhamento
6. **Ambiente**: Criar um espaço calmo e acolhedor para as atividades

## 📊 Acompanhamento do Progresso

### Marcadores de Sucesso
- ✅ Produção correta do /r/ em palavras isoladas
- ✅ Uso adequado em frases simples
- ✅ Generalização para fala espontânea
- ✅ Manutenção da produção ao longo do tempo

### Estratégias de Manutenção
- Prática regular mesmo após a aquisição
- Integração em atividades do dia a dia
- Envolvimento da família no processo

## 🎉 Conclusão

Este kit oferece uma base sólida e científica para o desenvolvimento do fonema /r/. Lembre-se de adaptar os exercícios às necessidades específicas de cada criança e sempre buscar orientação profissional quando necessário.

**Boa sorte no seu trabalho terapêutico!** 🌟`,
    type: ResourceType.PDF,
    category: 'Fonemas',
    ageGroup: '4-6 anos',
    fileSize: '2.3 MB',
    downloadCount: 1247,
    viewCount: 2100,
    rating: 4.8,
    tags: ['fonema-r', 'articulação', 'crianças', 'exercícios'],
    downloadUrl: '/pdfs/guia-exercicios-desenvolvimento-fala.pdf',
    viewUrl: '/recursos/fonema-r',
    thumbnailUrl: '/images/resources/fonema-r-thumb.jpg',
    isFree: true,
    isFeatured: true,
  },
  {
    title: 'Exercícios Respiratórios para Melhora da Fala',
    description:
      'Demonstração prática de técnicas respiratórias que auxiliam no desenvolvimento da fala e controle vocal. Ideal para crianças e adultos.',
    content: `# Exercícios Respiratórios para Melhora da Fala

## 🌬️ Importância da Respiração na Fala

A respiração é a base de uma fala clara e eficiente. Uma respiração adequada melhora:
- **A projeção da voz** e clareza na comunicação
- **O controle vocal** e modulação adequada
- **A resistência para falar** por períodos mais longos
- **A qualidade da voz** e expressividade
- **A confiança** na comunicação

## 🎯 Fundamentos da Respiração Diafragmática

### Anatomia da Respiração
- **Diafragma**: Principal músculo da respiração
- **Músculos intercostais**: Auxiliam na expansão torácica
- **Músculos abdominais**: Controlam a expiração
- **Postura**: Fundamental para eficiência respiratória

## 🚀 Exercícios Básicos

### 1. Respiração Diafragmática
- **Posição**: Deitado ou sentado confortavelmente
- **Técnica**: Inspirar pelo nariz, expandindo o abdômen
- **Duração**: 5-10 minutos diários
- **Progressão**: Aumentar gradualmente o tempo

### 2. Controle de Expiração
- **Objetivo**: Aumentar o tempo de expiração
- **Exercício**: Soprar uma vela sem apagá-la
- **Progressão**: Aumentar gradualmente a distância
- **Variação**: Usar bolinhas de sabão

### 3. Exercícios com Sons
- **Vogais prolongadas**: A, E, I, O, U (5-10 segundos cada)
- **Consoantes contínuas**: S, F, X, Z
- **Palavras**: Contar de 1 a 10 em uma expiração
- **Frases**: Falar frases completas sem pausas

## 🎮 Exercícios Avançados

### 1. Respiração com Movimento
- **Caminhada**: Inspirar em 2 passos, expirar em 4
- **Braços**: Elevar inspirando, abaixar expirando
- **Tronco**: Rotação coordenada com a respiração
- **Dança**: Movimentos livres sincronizados com a respiração

### 2. Técnicas de Relaxamento
- **Relaxamento progressivo**: Tensionar e relaxar grupos musculares
- **Visualização**: Imaginar um lugar calmo e seguro
- **Meditação**: Focar na respiração por 5-10 minutos
- **Mindfulness**: Atenção plena ao momento presente

### 3. Exercícios Específicos para Fala
- **Leitura em voz alta**: Com controle respiratório
- **Cantos**: Trabalhar diferentes alturas e intensidades
- **Debates**: Manter controle durante discussões
- **Apresentações**: Projeção vocal adequada

## 💡 Dicas Importantes

1. **Postura**: Manter a coluna alinhada e ombros relaxados
2. **Ritmo**: Respirar de forma natural e confortável
3. **Paciência**: Os resultados aparecem com a prática consistente
4. **Consistência**: Praticar diariamente por 15-20 minutos
5. **Profissional**: Buscar orientação de um fonoaudiólogo
6. **Ambiente**: Escolher um local calmo e sem distrações

## 📊 Acompanhamento do Progresso

### Marcadores de Melhoria
- ✅ Maior controle da respiração durante a fala
- ✅ Redução da fadiga vocal
- ✅ Melhora na projeção da voz
- ✅ Aumento da resistência para falar
- ✅ Maior confiança na comunicação

### Estratégias de Manutenção
- Prática regular mesmo após a melhoria
- Integração dos exercícios na rotina diária
- Monitoramento da postura durante a fala
- Exercícios de aquecimento antes de apresentações

## 🎉 Conclusão

A respiração adequada é fundamental para uma fala eficiente e confiante. Com prática regular e orientação profissional, você notará melhorias significativas na sua comunicação e qualidade de vida.

**Respire, fale e comunique-se com confiança!** 🌟`,
    type: ResourceType.VIDEO,
    category: 'Respiração',
    ageGroup: 'Todas as idades',
    duration: '8 min',
    downloadCount: 850,
    viewCount: 1500,
    rating: 4.9,
    tags: ['respiração', 'controle-vocal', 'técnicas'],
    downloadUrl: '/pdfs/planilha-avaliacao-fonologica.pdf',
    viewUrl: '/recursos/exercicios-respiratorios',
    thumbnailUrl: '/images/resources/respiracao-thumb.jpg',
    isFree: true,
    isFeatured: true,
  },
  {
    title: 'Coleção de Sons e Palavras para Treino Auditivo',
    description:
      'Biblioteca de áudios com diferentes fonemas, palavras e frases para treino auditivo e de pronúncia. Inclui exercícios de discriminação auditiva.',
    content: `# Coleção de Sons e Palavras para Treino Auditivo

## 🎧 Importância do Treino Auditivo

O treino auditivo é fundamental para o desenvolvimento da linguagem e fala. Esta coleção oferece exercícios estruturados para:
- **Desenvolver a discriminação auditiva** entre sons similares
- **Melhorar a consciência fonológica** e percepção de sons
- **Fortalecer a memória auditiva** e processamento temporal
- **Aumentar a atenção auditiva** e concentração
- **Facilitar a aquisição da fala** e pronúncia correta

## 🎯 Objetivos Terapêuticos

### Desenvolvimento da Discriminação Auditiva
- **Reconhecer diferenças** entre fonemas similares
- **Identificar padrões sonoros** em palavras e frases
- **Distinguir sons** em diferentes contextos
- **Melhorar a precisão** na percepção auditiva

### Consciência Fonológica
- **Segmentação de palavras** em sílabas e fonemas
- **Identificação de rimas** e aliterações
- **Manipulação de sons** (adição, subtração, substituição)
- **Reconhecimento de padrões** sonoros

## 🚀 Exercícios Básicos

### 1. Discriminação de Fonemas
- **Pares mínimos**: /p/ vs /b/, /t/ vs /d/, /f/ vs /v/
- **Fonemas líquidos**: /l/ vs /r/, /l/ vs /lh/
- **Fonemas nasais**: /m/ vs /n/, /n/ vs /nh/
- **Fonemas fricativos**: /s/ vs /z/, /f/ vs /v/

### 2. Treino de Palavras
- **Palavras isoladas**: Pronúncia clara e pausada
- **Palavras em contexto**: Uso em frases simples
- **Palavras polissilábicas**: Dificuldade progressiva
- **Palavras com acento**: Diferentes posições tônicas

### 3. Exercícios de Rima
- **Identificação de rimas**: "casa" rima com "asa"
- **Produção de rimas**: Completar pares rimados
- **Categorização**: Agrupar palavras por rima
- **Criação de versos**: Atividades criativas com rimas

## 🎮 Exercícios Avançados

### 1. Segmentação Fonêmica
- **Contar fonemas**: Quantos sons tem a palavra "casa"?
- **Primeiro som**: Qual é o primeiro som de "bola"?
- **Último som**: Qual é o último som de "mesa"?
- **Som do meio**: Qual som está no meio de "casa"?

### 2. Manipulação de Sons
- **Substituição**: Trocar /p/ por /b/ em "pato" = "bato"
- **Adição**: Adicionar /s/ no início de "ala" = "sala"
- **Subtração**: Remover /s/ de "sala" = "ala"
- **Inversão**: Trocar ordem dos sons

### 3. Memória Auditiva
- **Repetição de sequências**: Sons, palavras, frases
- **Compreensão de instruções**: Seguir comandos orais
- **Histórias auditivas**: Compreender narrativas
- **Jogos de memória**: Atividades lúdicas

## 💡 Estratégias de Aplicação

### Para Fonoaudiólogos
1. **Avaliação inicial**: Identificar dificuldades específicas
2. **Progressão gradual**: Começar com exercícios mais simples
3. **Feedback imediato**: Corrigir e reforçar respostas
4. **Prática regular**: Sessões diárias de 15-20 minutos
5. **Adaptação**: Modificar conforme necessidades individuais

### Para Pais e Cuidadores
1. **Ambiente calmo**: Reduzir ruídos de fundo
2. **Paciência**: Permitir tempo para processamento
3. **Reforço positivo**: Elogiar tentativas e acertos
4. **Integração**: Usar exercícios no dia a dia
5. **Consistência**: Manter rotina de prática

## 📊 Acompanhamento do Progresso

### Marcadores de Sucesso
- ✅ Melhora na discriminação de sons similares
- ✅ Aumento da precisão na identificação de fonemas
- ✅ Desenvolvimento da consciência fonológica
- ✅ Melhora na memória auditiva
- ✅ Aumento da confiança na comunicação

### Estratégias de Manutenção
- Prática regular mesmo após a melhoria
- Integração dos exercícios em atividades cotidianas
- Uso de jogos e atividades lúdicas
- Envolvimento da família no processo

## 🎉 Conclusão

Esta coleção oferece uma base sólida para o desenvolvimento auditivo e fonológico. Com prática consistente e orientação profissional, você notará melhorias significativas na percepção e produção de sons.

**Escute, aprenda e comunique-se com clareza!** 🌟`,
    type: ResourceType.AUDIO,
    category: 'Audição',
    ageGroup: '3-8 anos',
    fileSize: '15.2 MB',
    downloadCount: 2103,
    viewCount: 3200,
    rating: 4.7,
    tags: ['audição', 'discriminação', 'pronúncia', 'fonemas'],
    downloadUrl: '/pdfs/exercicios-fonemas-liquidos.pdf',
    viewUrl: '/recursos/treino-auditivo',
    thumbnailUrl: '/images/resources/audio-thumb.jpg',
    isFree: true,
    isFeatured: true,
  },
  {
    title: 'Guia de Exercícios para TEA',
    description:
      'Recursos especializados para desenvolvimento de linguagem em crianças com Transtorno do Espectro Autista. Inclui estratégias visuais e adaptações.',
    content: `# Guia de Exercícios para TEA

## 🧩 Compreendendo o TEA e a Linguagem

O Transtorno do Espectro Autista (TEA) afeta a comunicação e interação social de forma única. Este guia oferece estratégias baseadas em evidências para:
- **Desenvolver habilidades comunicativas** de forma individualizada
- **Utilizar recursos visuais** para facilitar a compreensão
- **Criar ambientes estruturados** que promovam o aprendizado
- **Adaptar atividades** às necessidades específicas de cada criança
- **Fortalecer a interação social** e comunicação funcional

## 🎯 Objetivos Terapêuticos

### Desenvolvimento da Comunicação
- **Comunicação funcional**: Expressar necessidades e desejos
- **Linguagem receptiva**: Compreender instruções e conversas
- **Linguagem expressiva**: Usar palavras e frases adequadamente
- **Comunicação social**: Interagir com outras pessoas
- **Comunicação alternativa**: Usar recursos quando necessário

### Habilidades Sociais
- **Contato visual**: Estabelecer e manter contato visual
- **Atenção compartilhada**: Focar em atividades conjuntas
- **Imitação**: Repetir ações e sons
- **Jogo simbólico**: Usar objetos de forma criativa
- **Interação com pares**: Brincar e comunicar com outras crianças

## 🚀 Estratégias Visuais

### 1. PECS (Picture Exchange Communication System)
- **Fase 1**: Trocar figura por item desejado
- **Fase 2**: Distância e persistência
- **Fase 3**: Discriminação entre figuras
- **Fase 4**: Estrutura de frase
- **Fase 5**: Responder "O que você quer?"
- **Fase 6**: Comentários e respostas

### 2. Agendas Visuais
- **Sequência de atividades**: Mostrar o que vem depois
- **Transições**: Preparar para mudanças
- **Rotinas**: Estruturar o dia a dia
- **Expectativas**: Clarificar o que vai acontecer
- **Escolhas**: Permitir decisões visuais

### 3. Histórias Sociais
- **Situações específicas**: Explicar eventos sociais
- **Comportamentos esperados**: Mostrar o que fazer
- **Perspectiva social**: Entender sentimentos dos outros
- **Resolução de problemas**: Enfrentar desafios
- **Habilidades de vida**: Tarefas cotidianas

## 🎮 Exercícios Práticos

### 1. Atividades de Imitação
- **Imitação motora**: Copiar movimentos corporais
- **Imitação vocal**: Repetir sons e palavras
- **Imitação com objetos**: Usar brinquedos de forma similar
- **Imitação em sequência**: Repetir sequências de ações
- **Imitação espontânea**: Copiar comportamentos naturalmente

### 2. Jogos Interativos
- **Jogos de turno**: Alternar ações com o parceiro
- **Jogos de espera**: Aguardar a vez com paciência
- **Jogos cooperativos**: Trabalhar juntos para um objetivo
- **Jogos de regras**: Seguir instruções simples
- **Jogos criativos**: Usar imaginação e criatividade

### 3. Atividades de Linguagem
- **Rotinas verbais**: Frases fixas para situações
- **Expansão de vocabulário**: Aprender novas palavras
- **Estrutura de frases**: Formar sentenças completas
- **Perguntas e respostas**: Interagir verbalmente
- **Narrativas**: Contar histórias e eventos

## 💡 Adaptações e Modificações

### Ambiente Físico
- **Espaço organizado**: Áreas claramente definidas
- **Redução de estímulos**: Minimizar distrações visuais e auditivas
- **Materiais acessíveis**: Recursos ao alcance da criança
- **Iluminação adequada**: Evitar luzes muito brilhantes
- **Acústica controlada**: Reduzir ruídos de fundo

### Estratégias Comunicativas
- **Linguagem simples**: Frases curtas e claras
- **Pausas adequadas**: Dar tempo para processamento
- **Repetições**: Reforçar informações importantes
- **Gestos e sinais**: Apoiar a comunicação verbal
- **Reforço positivo**: Elogiar tentativas e sucessos

### Modificações de Atividades
- **Duração ajustada**: Atividades mais curtas ou longas
- **Dificuldade progressiva**: Começar simples e aumentar
- **Interesses específicos**: Usar temas de interesse da criança
- **Flexibilidade**: Adaptar conforme necessário
- **Individualização**: Personalizar para cada criança

## 📊 Acompanhamento do Progresso

### Marcadores de Desenvolvimento
- ✅ Aumento da comunicação funcional
- ✅ Melhora na interação social
- ✅ Desenvolvimento da linguagem expressiva
- ✅ Uso adequado de recursos visuais
- ✅ Redução de comportamentos desafiadores

### Estratégias de Manutenção
- Prática regular das habilidades aprendidas
- Generalização para diferentes contextos
- Envolvimento da família no processo
- Adaptação contínua das estratégias
- Celebração dos progressos alcançados

## 🎉 Conclusão

Este guia oferece uma base sólida para o trabalho com crianças com TEA. Lembre-se de que cada criança é única e pode precisar de adaptações específicas. A paciência, consistência e amor são fundamentais para o sucesso.

**Cada pequeno progresso é uma grande conquista!** 🌟`,
    type: ResourceType.GUIDE,
    category: 'TEA',
    ageGroup: '2-10 anos',
    fileSize: '4.1 MB',
    downloadCount: 892,
    viewCount: 1200,
    rating: 4.9,
    tags: ['tea', 'autismo', 'linguagem', 'estratégias-visuais'],
    downloadUrl: '/pdfs/manual-estimulacao-precoce.pdf',
    viewUrl: '/recursos/guia-tea',
    thumbnailUrl: '/images/resources/tea-thumb.jpg',
    isFree: false,
    isFeatured: false,
  },
  {
    title: 'Série de Vídeos: Fonemas Básicos',
    description:
      'Demonstrações práticas de articulação dos fonemas mais comuns. Ideal para pais e terapeutas que trabalham com crianças.',
    content: `# Série de Vídeos: Fonemas Básicos

## 🎬 Importância da Demonstração Visual

A demonstração visual é uma ferramenta poderosa para o aprendizado da articulação. Esta série oferece:
- **Modelagem clara** de cada fonema em diferentes posições
- **Instruções passo a passo** para produção correta
- **Exercícios práticos** com feedback visual
- **Dicas específicas** para cada som
- **Progressão gradual** de dificuldade

## 🎯 Objetivos da Série

### Desenvolvimento da Articulação
- **Produção correta** dos fonemas básicos
- **Posicionamento adequado** dos órgãos fonoarticulatórios
- **Coordenação** entre respiração e articulação
- **Automatização** dos sons na fala espontânea
- **Generalização** para diferentes contextos

### Aprendizado Eficaz
- **Compreensão visual** do movimento necessário
- **Imitação precisa** baseada na observação
- **Correção imediata** de erros de articulação
- **Motivação** através de demonstrações claras
- **Confiança** na capacidade de produzir os sons

## 🚀 Fonemas Trabalhados

### 1. Fonemas Oclusivos
- **/p/ e /b/**: Posicionamento dos lábios
- **/t/ e /d/**: Posição da língua no alvéolo
- **/k/ e /g/**: Elevação da parte posterior da língua
- **Dicas específicas**: Pressão, duração e coordenação

### 2. Fonemas Fricativos
- **/f/ e /v/**: Contato lábio-dental
- **/s/ e /z/**: Posição da língua e fluxo de ar
- **/ʃ/ e /ʒ/**: Posicionamento para sons "ch" e "j"
- **/x/**: Produção do som "rr" fricativo

### 3. Fonemas Nasais
- **/m/**: Oclusão labial com ressonância nasal
- **/n/**: Oclusão alveolar com ressonância nasal
- **/ɲ/**: Oclusão palatal com ressonância nasal
- **Diferenças**: Contraste entre nasal e oral

### 4. Fonemas Líquidos
- **/l/**: Posição lateral da língua
- **/r/**: Vibração da ponta da língua
- **/ʎ/**: Posição palatal da língua
- **Transições**: Movimento entre diferentes posições

## 🎮 Estrutura dos Vídeos

### 1. Apresentação do Fonema
- **Nome e símbolo** do fonema
- **Características** articulatórias
- **Posições** na palavra (inicial, medial, final)
- **Exemplos** de palavras

### 2. Demonstração Articulatória
- **Posicionamento** dos órgãos fonoarticulatórios
- **Movimento** necessário para produção
- **Coordenação** com respiração
- **Variações** de intensidade e duração

### 3. Exercícios Práticos
- **Imitação** do fonema isolado
- **Sílabas** com vogais diferentes
- **Palavras** em diferentes posições
- **Frases** com o fonema em contexto

### 4. Dicas e Correções
- **Erros comuns** e como evitá-los
- **Estratégias** para facilitar a produção
- **Adaptações** para diferentes idades
- **Exercícios** complementares

## 💡 Estratégias de Uso

### Para Fonoaudiólogos
1. **Avaliação inicial**: Identificar fonemas com dificuldade
2. **Seleção de vídeos**: Escolher conforme necessidades
3. **Prática supervisionada**: Acompanhar a execução
4. **Feedback imediato**: Corrigir e reforçar
5. **Generalização**: Aplicar em contextos reais

### Para Pais e Cuidadores
1. **Ambiente adequado**: Local calmo e sem distrações
2. **Participação ativa**: Praticar junto com a criança
3. **Paciência**: Permitir tempo para aprendizado
4. **Reforço positivo**: Elogiar tentativas e progressos
5. **Consistência**: Praticar regularmente

### Para Crianças
1. **Observação atenta**: Prestar atenção nas demonstrações
2. **Tentativas**: Não ter medo de errar
3. **Prática**: Repetir os exercícios
4. **Divertimento**: Tornar o aprendizado lúdico
5. **Persistência**: Continuar mesmo com dificuldades

## 📊 Acompanhamento do Progresso

### Marcadores de Sucesso
- ✅ Produção correta do fonema isolado
- ✅ Uso adequado em sílabas e palavras
- ✅ Generalização para fala espontânea
- ✅ Redução de erros de articulação
- ✅ Aumento da confiança na fala

### Estratégias de Manutenção
- Prática regular dos fonemas aprendidos
- Integração em atividades cotidianas
- Uso de jogos e brincadeiras
- Envolvimento da família no processo
- Celebração dos progressos

## 🎉 Conclusão

Esta série oferece uma base sólida para o desenvolvimento da articulação. Com prática consistente e orientação adequada, você notará melhorias significativas na clareza e precisão da fala.

**Fale com clareza e confiança!** 🌟`,
    type: ResourceType.VIDEO,
    category: 'Fonemas',
    ageGroup: '3-7 anos',
    duration: '25 min',
    downloadCount: 1456,
    viewCount: 2200,
    rating: 4.6,
    tags: ['fonemas', 'articulação', 'demonstração', 'básicos'],
    downloadUrl: '/pdfs/atividades-consciencia-fonologica.pdf',
    viewUrl: '/recursos/fonemas-basicos',
    thumbnailUrl: '/images/resources/fonemas-basicos-thumb.jpg',
    isFree: true,
    isFeatured: false,
  },
  {
    title: 'Exercícios de Motricidade Orofacial',
    description:
      'Atividades para fortalecimento e coordenação dos músculos da face e boca. Inclui exercícios para lábios, língua e bochechas.',
    content: `# Exercícios de Motricidade Orofacial

## 💪 Importância da Motricidade Orofacial

A motricidade orofacial é fundamental para o desenvolvimento da fala e alimentação. Este guia oferece exercícios estruturados para:
- **Fortalecer os músculos** da face, lábios, língua e bochechas
- **Melhorar a coordenação** entre os diferentes grupos musculares
- **Aumentar a amplitude** e precisão dos movimentos
- **Desenvolver a força** necessária para a articulação
- **Promover a consciência** dos movimentos orofaciais

## 🎯 Objetivos Terapêuticos

### Desenvolvimento Muscular
- **Força muscular**: Aumentar a resistência dos músculos
- **Amplitude de movimento**: Expandir a capacidade de movimento
- **Precisão**: Melhorar a exatidão dos movimentos
- **Velocidade**: Desenvolver agilidade na execução
- **Coordenação**: Sincronizar diferentes grupos musculares

### Habilidades Funcionais
- **Articulação**: Melhorar a produção dos fonemas
- **Mastigação**: Facilitar o processo de alimentação
- **Deglutição**: Otimizar o ato de engolir
- **Expressão facial**: Desenvolver comunicação não-verbal
- **Respiração**: Coordenar com movimentos orofaciais

## 🚀 Exercícios para Lábios

### 1. Exercícios de Força
- **Apertar os lábios**: Manter fechados por 5 segundos
- **Sopro com resistência**: Soprar contra a resistência dos dedos
- **Vibração labial**: Fazer "brrr" com os lábios
- **Sucção**: Puxar os lábios para dentro e soltar
- **Protrusão**: Esticar os lábios para frente

### 2. Exercícios de Coordenação
- **Abertura e fechamento**: Abrir e fechar os lábios ritmicamente
- **Movimentos laterais**: Mover os lábios para os lados
- **Formação de vogais**: A, E, I, O, U com exagero
- **Sopro direcionado**: Soprar em diferentes direções
- **Imitação de expressões**: Sorriso, bico, surpresa

### 3. Exercícios Lúdicos
- **Beijinhos**: Fazer beijos no ar
- **Soprar bolinhas**: Usar bolinhas de sabão
- **Imitar animais**: Fazer bicos como pato, beijar como peixe
- **Jogos de sopro**: Mover objetos com o sopro
- **Música**: Cantar com movimentos exagerados

## 🎮 Exercícios para Língua

### 1. Exercícios de Força
- **Pressionar contra o céu da boca**: Manter por 5 segundos
- **Pressionar contra os dentes**: Frente, lados, atrás
- **Elevação da ponta**: Tocar o nariz com a ponta da língua
- **Depressão da ponta**: Tocar o queixo com a ponta
- **Lateralização**: Tocar as bochechas com a ponta

### 2. Exercícios de Coordenação
- **Movimentos circulares**: Fazer círculos dentro da boca
- **Movimentos laterais**: Mover de um lado para o outro
- **Movimentos verticais**: Subir e descer a língua
- **Movimentos horizontais**: Frente e trás
- **Combinações**: Sequências de movimentos

### 3. Exercícios Funcionais
- **Lamber lábios**: Limpar os lábios com a língua
- **Lamber sorvete**: Simular lamber sorvete
- **Movimentos de mastigação**: Simular mastigar
- **Movimentos de deglutição**: Simular engolir
- **Articulação**: Produzir diferentes fonemas

## 🎨 Exercícios para Bochechas

### 1. Exercícios de Força
- **Encher as bochechas**: Com ar, sem ar
- **Pressionar as bochechas**: Com os dedos, com a língua
- **Movimentos de sucção**: Puxar as bochechas para dentro
- **Movimentos de sopro**: Encher e esvaziar as bochechas
- **Movimentos de mastigação**: Simular mastigar

### 2. Exercícios de Coordenação
- **Movimentos alternados**: Uma bochecha de cada vez
- **Movimentos simultâneos**: Ambas as bochechas juntas
- **Movimentos rítmicos**: Seguir um ritmo
- **Movimentos direcionais**: Diferentes direções
- **Movimentos combinados**: Com lábios e língua

### 3. Exercícios Lúdicos
- **Imitar animais**: Bochechas de hamster, bochechas de peixe
- **Jogos de sopro**: Encher balões imaginários
- **Expressões faciais**: Sorriso, surpresa, tristeza
- **Música**: Cantar com movimentos exagerados
- **Histórias**: Representar personagens

## 💡 Estratégias de Aplicação

### Para Fonoaudiólogos
1. **Avaliação inicial**: Identificar músculos com fraqueza
2. **Seleção de exercícios**: Escolher conforme necessidades
3. **Progressão gradual**: Aumentar dificuldade aos poucos
4. **Feedback visual**: Usar espelhos e recursos visuais
5. **Integração funcional**: Aplicar em atividades reais

### Para Pais e Cuidadores
1. **Ambiente adequado**: Local calmo e confortável
2. **Participação ativa**: Fazer os exercícios junto
3. **Paciência**: Permitir tempo para aprendizado
4. **Reforço positivo**: Elogiar tentativas e progressos
5. **Consistência**: Praticar regularmente

### Para Crianças
1. **Divertimento**: Tornar os exercícios lúdicos
2. **Imitação**: Copiar movimentos do adulto
3. **Exploração**: Descobrir diferentes movimentos
4. **Criatividade**: Inventar novos exercícios
5. **Persistência**: Continuar mesmo com dificuldades

## 📊 Acompanhamento do Progresso

### Marcadores de Sucesso
- ✅ Aumento da força muscular
- ✅ Melhora na coordenação dos movimentos
- ✅ Maior amplitude de movimento
- ✅ Melhora na articulação
- ✅ Aumento da consciência corporal

### Estratégias de Manutenção
- Prática regular dos exercícios
- Integração em atividades cotidianas
- Uso de jogos e brincadeiras
- Envolvimento da família no processo
- Celebração dos progressos

## 🎉 Conclusão

Este guia oferece uma base sólida para o desenvolvimento da motricidade orofacial. Com prática consistente e orientação adequada, você notará melhorias significativas na força, coordenação e funcionalidade dos músculos orofaciais.

**Fortaleça, coordene e comunique-se com eficiência!** 🌟`,
    type: ResourceType.PDF,
    category: 'Motricidade',
    ageGroup: '4-12 anos',
    fileSize: '3.2 MB',
    downloadCount: 678,
    viewCount: 1100,
    rating: 4.5,
    tags: ['motricidade', 'músculos', 'coordenação', 'face'],
    downloadUrl: '/pdfs/protocolo-avaliacao-fluencia.pdf',
    viewUrl: '/recursos/motricidade-orofacial',
    thumbnailUrl: '/images/resources/motricidade-thumb.jpg',
    isFree: true,
    isFeatured: false,
  },
  {
    title: 'Atividades de Consciência Fonológica',
    description:
      'Exercícios práticos para desenvolvimento da consciência fonológica em crianças. Inclui atividades de rima, segmentação e manipulação de sons.',
    content: `# Atividades de Consciência Fonológica

## 🧠 Importância da Consciência Fonológica

A consciência fonológica é a capacidade de reconhecer e manipular os sons da fala. Este guia oferece atividades estruturadas para:
- **Desenvolver a percepção** dos sons da fala
- **Melhorar a segmentação** de palavras em sílabas e fonemas
- **Fortalecer a manipulação** de sons (adição, subtração, substituição)
- **Aumentar a consciência** de rimas e aliterações
- **Facilitar o aprendizado** da leitura e escrita

## 🎯 Objetivos Terapêuticos

### Desenvolvimento da Consciência Fonológica
- **Reconhecimento de sons**: Identificar fonemas em palavras
- **Segmentação**: Dividir palavras em unidades menores
- **Síntese**: Combinar sons para formar palavras
- **Manipulação**: Modificar sons em palavras
- **Categorização**: Agrupar palavras por características sonoras

### Habilidades Metalinguísticas
- **Reflexão sobre a linguagem**: Pensar sobre os sons
- **Análise sonora**: Examinar características dos fonemas
- **Comparação**: Identificar semelhanças e diferenças
- **Generalização**: Aplicar regras sonoras
- **Transferência**: Usar habilidades em diferentes contextos

## 🚀 Atividades de Rima

### 1. Identificação de Rimas
- **Pares rimados**: "casa" rima com "asa"
- **Trios rimados**: "casa", "asa", "massa"
- **Rimas em contexto**: Encontrar rimas em frases
- **Rimas visuais**: Usar figuras para identificar rimas
- **Rimas auditivas**: Ouvir e identificar rimas

### 2. Produção de Rimas
- **Completar pares**: "casa" rima com "___"
- **Criar rimas**: Inventar palavras que rimam
- **Rimas em sequência**: Criar listas de palavras rimadas
- **Rimas em versos**: Criar pequenos poemas
- **Rimas em jogos**: Atividades lúdicas com rimas

### 3. Categorização por Rima
- **Agrupar palavras**: Separar por famílias rimadas
- **Identificar intrusos**: Encontrar palavras que não rimam
- **Criar famílias**: Organizar palavras por rima
- **Comparar famílias**: Analisar diferentes grupos
- **Expandir famílias**: Adicionar novas palavras

## 🎮 Atividades de Segmentação

### 1. Segmentação Silábica
- **Bater palmas**: Uma palma por sílaba
- **Contar sílabas**: Quantas sílabas tem "casa"?
- **Dividir palavras**: Separar "ca-sa"
- **Juntar sílabas**: "ca" + "sa" = "casa"
- **Identificar sílabas**: Primeira, última, do meio

### 2. Segmentação Fonêmica
- **Contar fonemas**: Quantos sons tem "casa"?
- **Identificar fonemas**: Primeiro, último, do meio
- **Substituir fonemas**: Trocar /c/ por /m/ em "casa"
- **Adicionar fonemas**: Adicionar /s/ no início
- **Remover fonemas**: Tirar /c/ de "casa"

### 3. Segmentação em Contexto
- **Frases**: Segmentar palavras em frases
- **Histórias**: Identificar palavras em narrativas
- **Músicas**: Segmentar palavras em canções
- **Jogos**: Atividades lúdicas com segmentação
- **Conversas**: Usar segmentação em diálogos

## 🎨 Atividades de Manipulação

### 1. Substituição de Fonemas
- **Substituição inicial**: Trocar primeiro som
- **Substituição medial**: Trocar som do meio
- **Substituição final**: Trocar último som
- **Substituição múltipla**: Trocar vários sons
- **Substituição criativa**: Inventar novas palavras

### 2. Adição e Subtração
- **Adição inicial**: Adicionar som no início
- **Adição final**: Adicionar som no final
- **Subtração inicial**: Tirar som do início
- **Subtração final**: Tirar som do final
- **Combinações**: Adicionar e subtrair

### 3. Inversão e Transposição
- **Inversão de sílabas**: "casa" → "saca"
- **Inversão de fonemas**: "casa" → "asac"
- **Transposição**: Trocar posições de sons
- **Reorganização**: Criar novas combinações
- **Experimentação**: Testar diferentes arranjos

## 💡 Estratégias de Aplicação

### Para Fonoaudiólogos
1. **Avaliação inicial**: Identificar nível de consciência
2. **Progressão gradual**: Começar com atividades mais simples
3. **Feedback imediato**: Corrigir e reforçar respostas
4. **Prática regular**: Sessões diárias de 15-20 minutos
5. **Generalização**: Aplicar em diferentes contextos

### Para Pais e Cuidadores
1. **Ambiente lúdico**: Tornar as atividades divertidas
2. **Participação ativa**: Envolver-se nas atividades
3. **Paciência**: Permitir tempo para processamento
4. **Reforço positivo**: Elogiar tentativas e acertos
5. **Consistência**: Manter rotina de prática

### Para Crianças
1. **Exploração**: Descobrir sons e padrões
2. **Criatividade**: Inventar novas combinações
3. **Jogos**: Aprender brincando
4. **Colaboração**: Trabalhar em grupo
5. **Persistência**: Continuar mesmo com dificuldades

## 📊 Acompanhamento do Progresso

### Marcadores de Sucesso
- ✅ Melhora na identificação de rimas
- ✅ Aumento da precisão na segmentação
- ✅ Desenvolvimento da manipulação de sons
- ✅ Melhora na consciência metalinguística
- ✅ Aumento da confiança na linguagem

### Estratégias de Manutenção
- Prática regular das habilidades aprendidas
- Integração em atividades cotidianas
- Uso de jogos e brincadeiras
- Envolvimento da família no processo
- Celebração dos progressos

## 🎉 Conclusão

Este guia oferece uma base sólida para o desenvolvimento da consciência fonológica. Com prática consistente e orientação adequada, você notará melhorias significativas na percepção e manipulação dos sons da fala.

**Descubra, explore e domine os sons da linguagem!** 🌟`,
    type: ResourceType.WORKSHEET,
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
    content: `# Guia de Estratégias para Gagueira

## 🗣️ Compreendendo a Gagueira

A gagueira é um distúrbio da fluência da fala que afeta a comunicação. Este guia oferece estratégias baseadas em evidências para:
- **Reduzir a frequência** e intensidade das disfluências
- **Melhorar a fluência** e naturalidade da fala
- **Aumentar a confiança** na comunicação
- **Desenvolver estratégias** de enfrentamento
- **Promover aceitação** e autoestima

## 🎯 Objetivos Terapêuticos

### Desenvolvimento da Fluência
- **Redução de disfluências**: Diminuir repetições, prolongamentos e bloqueios
- **Melhora da naturalidade**: Tornar a fala mais espontânea
- **Aumento da velocidade**: Desenvolver ritmo adequado
- **Melhora da coordenação**: Sincronizar respiração e articulação
- **Desenvolvimento de estratégias**: Usar técnicas de fluência

### Aspectos Emocionais
- **Redução da ansiedade**: Diminuir medo de falar
- **Aumento da confiança**: Melhorar autoestima
- **Aceitação**: Aprender a conviver com a gagueira
- **Comunicação eficaz**: Expressar-se com clareza
- **Qualidade de vida**: Melhorar bem-estar geral

## 🚀 Estratégias de Fluência

### 1. Técnicas de Fala
- **Fala lenta**: Reduzir velocidade para aumentar controle
- **Pausas**: Inserir pausas naturais na fala
- **Respiração**: Coordenar fala com respiração
- **Articulação suave**: Produzir sons de forma mais suave
- **Ritmo regular**: Manter ritmo constante

### 2. Estratégias de Relaxamento
- **Relaxamento muscular**: Reduzir tensão corporal
- **Respiração diafragmática**: Usar respiração profunda
- **Visualização**: Imaginar situações calmas
- **Meditação**: Praticar mindfulness
- **Exercícios de alongamento**: Relaxar músculos do pescoço e ombros

### 3. Técnicas de Modificação
- **Pull-out**: Modificar disfluências em andamento
- **Cancellation**: Pausar e refazer após disfluência
- **Preparatory set**: Preparar-se antes de falar
- **Easy onset**: Iniciar fala de forma suave
- **Light contact**: Articular com contato leve

## 🎮 Exercícios Práticos

### 1. Exercícios de Fluência
- **Leitura em voz alta**: Com ritmo lento e controlado
- **Fala monótona**: Usar tom uniforme
- **Fala prolongada**: Esticar vogais
- **Fala em coro**: Falar junto com outra pessoa
- **Fala com metrônomo**: Seguir ritmo musical

### 2. Exercícios de Relaxamento
- **Tensão e relaxamento**: Alternar tensão e relaxamento muscular
- **Respiração profunda**: Inspirar e expirar lentamente
- **Relaxamento progressivo**: Relaxar grupos musculares
- **Visualização guiada**: Imaginar cenários calmos
- **Meditação**: Praticar atenção plena

### 3. Exercícios de Confiança
- **Fala em público**: Praticar apresentações
- **Conversas estruturadas**: Dialogar sobre temas específicos
- **Jogos de comunicação**: Atividades lúdicas
- **Role-playing**: Simular situações sociais
- **Gravações**: Ouvir e analisar própria fala

## 💡 Estratégias para Diferentes Idades

### Crianças (3-6 anos)
- **Modelagem**: Demonstrar fala fluente
- **Reforço positivo**: Elogiar tentativas de fala
- **Ambiente calmo**: Reduzir pressão e estresse
- **Jogos**: Usar atividades lúdicas
- **Paciência**: Dar tempo para expressão

### Crianças (7-12 anos)
- **Conscientização**: Explicar sobre gagueira
- **Estratégias**: Ensinar técnicas de fluência
- **Prática**: Exercitar habilidades aprendidas
- **Apoio emocional**: Trabalhar aspectos psicológicos
- **Integração social**: Facilitar interação com pares

### Adolescentes e Adultos
- **Terapia intensiva**: Sessões mais frequentes
- **Estratégias avançadas**: Técnicas mais complexas
- **Apoio psicológico**: Trabalhar aspectos emocionais
- **Integração social**: Facilitar vida social
- **Manutenção**: Estratégias de longo prazo

## 🎨 Adaptações e Modificações

### Ambiente
- **Redução de ruído**: Minimizar distrações auditivas
- **Iluminação adequada**: Evitar luzes muito brilhantes
- **Espaço confortável**: Ambiente acolhedor
- **Privacidade**: Respeitar necessidade de privacidade
- **Acessibilidade**: Facilitar comunicação

### Comunicação
- **Linguagem simples**: Usar frases claras e diretas
- **Pausas adequadas**: Dar tempo para resposta
- **Contato visual**: Manter atenção durante conversa
- **Paciência**: Não interromper ou completar frases
- **Aceitação**: Aceitar a forma de falar da pessoa

### Atividades
- **Dificuldade progressiva**: Começar simples e aumentar
- **Interesses específicos**: Usar temas de interesse
- **Flexibilidade**: Adaptar conforme necessário
- **Individualização**: Personalizar para cada pessoa
- **Motivação**: Manter engajamento

## 📊 Acompanhamento do Progresso

### Marcadores de Melhoria
- ✅ Redução da frequência de disfluências
- ✅ Aumento da fluência e naturalidade
- ✅ Melhora na confiança para falar
- ✅ Redução da ansiedade comunicativa
- ✅ Melhora na qualidade de vida

### Estratégias de Manutenção
- Prática regular das técnicas aprendidas
- Integração das estratégias no dia a dia
- Apoio contínuo da família e amigos
- Acompanhamento profissional regular
- Celebração dos progressos

## 🎉 Conclusão

Este guia oferece uma base sólida para o trabalho com gagueira. Lembre-se de que cada pessoa é única e pode precisar de abordagens específicas. A paciência, compreensão e apoio são fundamentais para o sucesso.

**Comunique-se com confiança e naturalidade!** 🌟`,
    type: ResourceType.GUIDE,
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

    // Create or update resources
    console.log('📚 Creating/updating resources...');
    for (const resource of initialResources) {
      console.log(`Processing resource: ${resource.title}`);
      const slug = createSlug(resource.title);
      const resourceData = { ...resource, slug };

      const existingResource = await prisma.resource.findFirst({
        where: { title: resource.title },
      });

      if (existingResource) {
        console.log(`Found existing resource with ID: ${existingResource.id}`);
        await prisma.resource.update({
          where: { id: existingResource.id },
          data: resourceData,
        });
        console.log(`Updated resource: ${resource.title} with slug: ${slug}`);
      } else {
        console.log(`Creating new resource: ${resource.title}`);
        await prisma.resource.create({
          data: resourceData,
        });
        console.log(`Created resource: ${resource.title} with slug: ${slug}`);
      }
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
