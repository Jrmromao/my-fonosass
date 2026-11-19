import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';

jest.mock('@/hooks/useCSRF', () => ({
  useCSRF: () => ({ csrfToken: 'tok' }),
}));
// Radix Select needs pointer APIs jsdom lacks; the filter is not under test.
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: () => null,
  SelectContent: () => null,
  SelectItem: () => null,
}));

import { ActivityEditDialog } from '@/components/dashboard/ActivityEditDialog';
import { ActivityManagerPanel } from '@/components/dashboard/ActivityManagerPanel';

const wrap = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
};

// @testing-library/user-event is not installed; fireEvent is enough here.
const userEvent = {
  click: async (el: Element) => fireEvent.click(el),
  clear: async (el: Element) => fireEvent.change(el, { target: { value: '' } }),
  type: async (el: Element, text: string) =>
    fireEvent.change(el, {
      target: { value: (el as HTMLInputElement).value + text },
    }),
};

const json = (body: unknown, status = 200) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
  } as Response);

const fetchMock = jest.fn<typeof fetch>();
beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('ActivityEditDialog', () => {
  const activity = {
    id: 'a1',
    name: 'Titulo antigo',
    description: 'Descrição antiga longa',
  };

  it('sends PATCH with the edited values, then closes and refreshes', async () => {
    fetchMock.mockReturnValue(json({ success: true, data: activity }));
    const onSaved = jest.fn();
    const onClose = jest.fn();
    wrap(
      <ActivityEditDialog
        activity={activity}
        onSaved={onSaved}
        onClose={onClose}
      />
    );

    const title = screen.getByLabelText('Título');
    await userEvent.clear(title);
    await userEvent.type(title, 'Título corrigido');
    expect(screen.getByText('16/100')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/admin/activities/a1');
    expect(init.method).toBe('PATCH');
    expect((init.headers as Record<string, string>)['X-CSRF-Token']).toBe(
      'tok'
    );
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Título corrigido',
      description: 'Descrição antiga longa',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the server error and stays open', async () => {
    fetchMock.mockReturnValue(
      json(
        {
          success: false,
          error: 'O título precisa ter pelo menos 3 caracteres.',
        },
        400
      )
    );
    const onClose = jest.fn();
    wrap(
      <ActivityEditDialog
        activity={activity}
        onSaved={jest.fn()}
        onClose={onClose}
      />
    );

    await userEvent.type(screen.getByLabelText('Título'), ' x');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'O título precisa ter pelo menos 3 caracteres.'
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps Salvar disabled until something changes', () => {
    wrap(
      <ActivityEditDialog
        activity={activity}
        onSaved={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(
      (screen.getByRole('button', { name: 'Salvar' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });
});

describe('ActivityManagerPanel row actions', () => {
  const row = (id: string, status: string, canDelete = false) => ({
    id,
    name: `Atividade ${status}`,
    description: 'Descrição da atividade',
    phoneme: 'P',
    type: 'ANIMALS',
    status,
    isPublic: status === 'PUBLISHED',
    canDelete,
    createdAt: '2026-11-01T00:00:00.000Z',
  });

  beforeEach(() => {
    fetchMock.mockReturnValue(
      json({
        success: true,
        activities: [
          row('1', 'PUBLISHED'),
          row('2', 'ARCHIVED'),
          row('3', 'DRAFT', true),
          row('4', 'REJECTED', false),
        ],
        pagination: { total: 4, totalPages: 1 },
      })
    );
  });

  const rowOf = async (status: string) =>
    within((await screen.findByText(`Atividade ${status}`)).closest('tr')!);

  it('shows each action only for the matching status', async () => {
    wrap(<ActivityManagerPanel />);

    const published = await rowOf('PUBLISHED');
    expect(
      published.queryByRole('button', { name: /Arquivar/ })
    ).not.toBeNull();
    expect(published.queryByRole('button', { name: /Restaurar/ })).toBeNull();
    expect(published.queryByRole('button', { name: /Excluir/ })).toBeNull();

    const archived = await rowOf('ARCHIVED');
    expect(
      archived.queryByRole('button', { name: /Restaurar/ })
    ).not.toBeNull();
    expect(archived.queryByRole('button', { name: /Arquivar/ })).toBeNull();
    expect(archived.queryByText('Arquivado')).not.toBeNull();

    const draft = await rowOf('DRAFT');
    expect(draft.queryByRole('button', { name: /Excluir/ })).not.toBeNull();

    // Rejected but not deletable (has history): no "Excluir".
    const rejected = await rowOf('REJECTED');
    expect(rejected.queryByRole('button', { name: /Excluir/ })).toBeNull();

    for (const r of [published, archived, draft, rejected]) {
      expect(r.queryByRole('button', { name: /Editar/ })).not.toBeNull();
    }
  });

  it('asks for confirmation before archiving, then POSTs with the CSRF token', async () => {
    wrap(<ActivityManagerPanel />);
    await userEvent.click(
      (await rowOf('PUBLISHED')).getByRole('button', { name: /Arquivar/ })
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog.textContent).toContain(
      'Some da biblioteca e os arquivos vão para o arquivo; o histórico é mantido.'.replace(
        'Some',
        'some'
      )
    );
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the list so far

    fetchMock.mockReturnValue(json({ success: true, data: {} }));
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Arquivar' })
    );

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(1));
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe('/api/admin/activities/1/archive');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['X-CSRF-Token']).toBe(
      'tok'
    );
  });

  it('names the activity in the delete confirmation', async () => {
    wrap(<ActivityManagerPanel />);
    await userEvent.click(
      (await rowOf('DRAFT')).getByRole('button', { name: /Excluir/ })
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog.textContent).toContain('Atividade DRAFT');
  });
});
