'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCSRF } from '@/hooks/useCSRF';
import { LIBRARY_PATH } from '@/lib/libraryUrl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Admin: edit the paragraph shown at the top of each library topic page.
// Saved in LibraryTopicContent; "Restaurar padrão" deletes the custom text.

// Keep in sync with TOPIC_ABOUT_MAX (lib/libraryTopicContent.ts, server-only).
const MAX = 800;

interface TopicContent {
  slug: string;
  title: string;
  defaultAbout: string;
  customAbout: string | null;
  updatedAt: string | null;
}

interface ListResponse {
  success: boolean;
  data?: TopicContent[];
  error?: string;
}

const QUERY_KEY = ['admin-library-topics'];

export function LibraryTopicsCard() {
  const { data, isLoading, isError, refetch } = useQuery<TopicContent[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/admin/library-topics');
      const json: ListResponse = await res.json().catch(() => ({
        success: false,
      }));
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Falha ao carregar');
      }
      return json.data;
    },
  });
  const [open, setOpen] = useState<string | null>(null);
  const customCount = data?.filter((t) => t.customAbout !== null).length ?? 0;

  return (
    <section className="rounded-2xl bg-violet-50 p-6">
      <h3 className="text-base font-semibold text-neutral-900">
        Textos da biblioteca
      </h3>
      <p className="mt-1 mb-5 text-sm text-neutral-600">
        O parágrafo que aparece no topo da página de cada fonema e tema. Sem
        texto próprio, a página usa o texto padrão.
        {data && ` ${customCount} de ${data.length} personalizados.`}
      </p>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Carregando…</p>
      ) : isError || !data ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar os textos.{' '}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => refetch()}
          >
            Tentar de novo
          </button>
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
          {data.map((topic) => (
            <li key={topic.slug}>
              <button
                type="button"
                aria-expanded={open === topic.slug}
                onClick={() => setOpen(open === topic.slug ? null : topic.slug)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-neutral-50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900">
                    {topic.title}
                  </span>
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[11px] font-semibold ${
                      topic.customAbout !== null
                        ? 'bg-sun-200 text-violet-950'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {topic.customAbout !== null ? 'Personalizado' : 'Padrão'}
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-neutral-600 transition-transform ${
                    open === topic.slug ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>
              {open === topic.slug && <TopicEditor topic={topic} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TopicEditor({ topic }: { topic: TopicContent }) {
  const queryClient = useQueryClient();
  const { csrfToken } = useCSRF();
  const [text, setText] = useState(topic.customAbout ?? topic.defaultAbout);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: 'ok' | 'error';
    text: string;
  } | null>(null);

  const current = topic.customAbout ?? topic.defaultAbout;
  const dirty = text.trim() !== current.trim();
  const tooLong = text.length > MAX;

  const send = async (method: 'PUT' | 'DELETE') => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/admin/library-topics/${encodeURIComponent(topic.slug)}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken ?? '',
          },
          body: method === 'PUT' ? JSON.stringify({ about: text }) : undefined,
        }
      );
      const json: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Não foi possível salvar.');
      }
      if (method === 'DELETE') setText(topic.defaultAbout);
      setMessage({
        kind: 'ok',
        text: method === 'PUT' ? 'Texto salvo.' : 'Texto padrão restaurado.',
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      // Topic pages read the text through ['library-topic', slug].
      queryClient.invalidateQueries({ queryKey: ['library-topic'] });
    } catch (error) {
      setMessage({
        kind: 'error',
        text:
          error instanceof Error ? error.message : 'Não foi possível salvar.',
      });
    } finally {
      setSaving(false);
    }
  };

  const fieldId = `topic-about-${topic.slug}`;

  return (
    <div className="space-y-3 border-t border-neutral-100 bg-neutral-50 px-4 py-4">
      <label htmlFor={fieldId} className="sr-only">
        Texto de {topic.title}
      </label>
      <Textarea
        id={fieldId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="bg-white text-sm"
        aria-describedby={`${fieldId}-count`}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span
          id={`${fieldId}-count`}
          className={
            tooLong ? 'font-semibold text-destructive' : 'text-neutral-600'
          }
        >
          {text.length}/{MAX} caracteres
        </span>
        <Link
          href={`${LIBRARY_PATH}/${topic.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 font-semibold text-neutral-900 underline underline-offset-2"
        >
          Ver página
          <ExternalLink className="h-3 w-3" aria-hidden />
        </Link>
      </div>
      {topic.customAbout !== null && (
        <details className="text-xs text-neutral-600">
          <summary className="cursor-pointer font-semibold">
            Ver texto padrão
          </summary>
          <p className="mt-1">{topic.defaultAbout}</p>
        </details>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="h-9 bg-neutral-900 text-white hover:bg-neutral-800"
          disabled={saving || !csrfToken || !dirty || tooLong || !text.trim()}
          onClick={() => send('PUT')}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
        {topic.customAbout !== null && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 border-neutral-300"
            disabled={saving || !csrfToken}
            onClick={() => send('DELETE')}
          >
            Restaurar padrão
          </Button>
        )}
      </div>
      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`text-sm ${
            message.kind === 'error' ? 'text-destructive' : 'text-green-800'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
