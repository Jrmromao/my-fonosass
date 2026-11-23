// Library topics: what the index page lists and what /dashboard/biblioteca/[topic]
// shows. A topic is a phoneme (/s/, /r/ forte, arquifonema...) or a language
// topic (cores, animais...). Built from the taxonomy in lib/phonemes.ts.
// Client-safe.

import { phonemeSlug } from '@/lib/libraryUrl';
import {
  CATALOG_TOPICS,
  LANGUAGE_TOPIC,
  PHONEME_GROUPS,
  type LanguageTopic,
  type PhonemeEntry,
} from '@/lib/phonemes';

export interface LibraryTopic {
  slug: string;
  /** Page heading, e.g. "Fonema /s/" or "Cores". */
  title: string;
  /** Default paragraph shown above the activities (admins can override). */
  about: string;
  /**
   * Group in the index (lib/phonemes.ts id, "linguagem", or "temas"):
   * sets the color. "temas" is the Outros section (cores, animais…).
   */
  groupId: string;
  /** Filter sent to /api/activities/search. */
  filter: { phoneme: string } | { type: string };
}

// Default paragraph per topic. DRAFTS written by the dev team. Admins replace
// them from Perfil > Administração > "Textos da biblioteca" (stored in
// LibraryTopicContent); these stay as the fallback and "Restaurar padrão".
const CLOSING = 'Clique na atividade para baixar e imprimir.';
const TOPIC_ABOUT: Record<string, string> = {
  P: 'Fonema plosivo bilabial surdo, como em “pato”. Atividades para produção e discriminação do /p/, inclusive em contraste com o /b/.',
  B: 'Fonema plosivo bilabial sonoro, como em “bola”. Atividades para produção do /b/ e para diferenciá-lo do /p/.',
  T: 'Fonema plosivo linguodental surdo, como em “tatu”. Atividades para produção do /t/ e contraste com o /d/.',
  D: 'Fonema plosivo linguodental sonoro, como em “dado”. Atividades para produção do /d/ e contraste com o /t/.',
  F: 'Fonema fricativo labiodental surdo, como em “faca”. Atividades para produção do /f/ e contraste com o /v/.',
  V: 'Fonema fricativo labiodental sonoro, como em “vaca”. Atividades para produção do /v/ e contraste com o /f/.',
  K: 'Fonema plosivo velar surdo, como em “casa”. Atividades para produção do /k/, frequentemente trocado por /t/, e contraste com o /g/.',
  G: 'Fonema plosivo velar sonoro, como em “gato”. Atividades para produção do /g/ e contraste com o /k/.',
  CH: 'Fonema fricativo palatal surdo, como em “chave”. Atividades para produção do /ch/ e contraste com o /j/ e o /s/.',
  J: 'Fonema fricativo palatal sonoro, como em “janela”. Atividades para produção do /j/ e contraste com o /ch/ e o /z/.',
  S: 'Fonema fricativo alveolar surdo, como em “sapo”. Atividades para produção do /s/, ceceio e contraste com o /z/.',
  Z: 'Fonema fricativo alveolar sonoro, como em “zebra”. Atividades para produção do /z/ e contraste com o /s/.',
  M: 'Fonema nasal bilabial, como em “macaco”. Atividades para produção do /m/ em diferentes posições na palavra.',
  N: 'Fonema nasal alveolar, como em “navio”. Atividades para produção do /n/ e contraste com o /m/.',
  L: 'Fonema lateral alveolar, como em “lua”. Atividades para produção do /l/ e para trabalhar a troca entre /l/ e /r/.',
  LH: 'Fonema lateral palatal, como em “palhaço”. Atividades para produção do /lh/, muitas vezes substituído por /l/ ou /i/.',
  R_FORTE:
    'O R forte, como em “rato” e “carro”. Atividades para produção da vibrante múltipla (ou da variante regional) em início de palavra e no “rr”.',
  R_FRACO:
    'O r fraco, como em “arara” e “barata”. Atividades para produção do tepe entre vogais e para o contraste com o /l/.',
  ARQ_S:
    'O /S/ no fim da sílaba, como em “pasta” e “lápis”. Atividades para a omissão do arquifonema em meio e fim de palavra.',
  ARQ_R:
    'O /R/ no fim da sílaba, como em “porta” e “mar”. Atividades para a omissão do arquifonema em meio e fim de palavra.',
  ENC_R:
    'Encontro consonantal com /r/, como em “prato” e “bruxa”. Atividades para a redução do encontro (“pato” por “prato”).',
  ENC_L:
    'Encontro consonantal com /l/, como em “planta” e “bloco”. Atividades para a redução e a troca do /l/ por /r/ no encontro.',
  linguagem:
    'Atividades de linguagem: vocabulário, compreensão e expressão, independente do fonema.',
  cores:
    'Vocabulário de cores: nomeação, compreensão e categorização. Independe do fonema.',
  animais:
    'Vocabulário de animais: nomeação, sons dos animais e categorização. Independe do fonema.',
  numeros:
    'Números e quantidades: nomeação, contagem e associação número–quantidade. Independe do fonema.',
  alfabeto:
    'Letras do alfabeto: nomeação, reconhecimento e associação letra–som. Independe do fonema.',
};

const unknownPhoneme = (code: string): PhonemeEntry => ({
  code,
  display: `/${code.toLowerCase()}/`,
  notation: true,
});

function phonemeAbout(entry: PhonemeEntry): string {
  const draft = TOPIC_ABOUT[entry.code];
  if (draft) return `${draft} ${CLOSING}`;
  const word = entry.example?.replace(/[[\]]/g, '');
  if (entry.notation) {
    return `Atividades para trabalhar o fonema ${entry.display}${
      word ? `, como em “${word}”` : ''
    }. ${CLOSING}`;
  }
  return `Atividades de ${entry.display}${entry.note ? `, ${entry.note}` : ''}. ${CLOSING}`;
}

export function phonemeTopic(
  entry: PhonemeEntry,
  groupId = 'outros'
): LibraryTopic {
  return {
    slug: phonemeSlug(entry.code),
    groupId,
    title: entry.notation ? `Fonema ${entry.display}` : entry.display,
    about: phonemeAbout(entry),
    filter: { phoneme: entry.code },
  };
}

function catalogTopic(topic: LanguageTopic): LibraryTopic | null {
  // Topics not in the catalog yet (no activity type) have no page.
  if (topic.types.length === 0) return null;
  const groupId = topic.id === LANGUAGE_TOPIC.id ? 'linguagem' : 'temas';
  return {
    slug: topic.id,
    groupId,
    title: topic.label,
    about:
      TOPIC_ABOUT[topic.id] !== undefined
        ? `${TOPIC_ABOUT[topic.id]} ${CLOSING}`
        : `Atividades de ${topic.label.toLowerCase()} para vocabulário e linguagem, independente do fonema. ${CLOSING}`,
    filter: { type: topic.types[0] },
  };
}

/**
 * Every topic with a page, in index order, with its DEFAULT paragraph.
 * Admins can replace the paragraph (LibraryTopicContent); see
 * /api/library/topics/[slug] and the "Textos da biblioteca" admin card.
 */
export function listTopics(): LibraryTopic[] {
  return [
    ...PHONEME_GROUPS.flatMap((g) =>
      g.entries.map((e) => phonemeTopic(e, g.id))
    ),
    ...CATALOG_TOPICS.map(catalogTopic).filter(
      (t): t is LibraryTopic => t !== null
    ),
  ];
}

/** Topics an admin can edit: the taxonomy ones (not legacy codes). */
export function isEditableTopic(slug: string): boolean {
  return listTopics().some((t) => t.slug === slug);
}

/** Topic for a URL slug, or null when it matches nothing. */
export function findTopic(slug: string): LibraryTopic | null {
  const known = listTopics().find((t) => t.slug === slug);
  if (known) return known;
  // Known catalog id without a type yet (e.g. alimentos) → no page.
  if (CATALOG_TOPICS.some((t) => t.id === slug)) return null;
  // A phoneme code still in the DB that the taxonomy doesn't list (e.g. "R").
  if (/^[a-z0-9-]{1,12}$/.test(slug)) {
    return phonemeTopic(unknownPhoneme(slug.toUpperCase().replace(/-/g, '_')));
  }
  return null;
}
