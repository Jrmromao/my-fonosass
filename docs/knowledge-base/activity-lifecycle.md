# Ciclo de vida das atividades: editar, arquivar, restaurar, excluir

Só ADMIN pode usar estas ações. Todas as rotas exigem CSRF, validam com Zod,
respondem `{ success, data, error }` e gravam um evento de auditoria.

## Status

```
DRAFT ──▶ PENDING_REVIEW ──▶ PUBLISHED ◀──▶ ARCHIVED
  │             │                │
  └──▶ REJECTED ◀┘ ◀─────────────┘   (REJECTED ──▶ PENDING_REVIEW)
```

Regras em `lib/activities/approval.ts` (`ALLOWED_TRANSITIONS`). Só
`PUBLISHED → ARCHIVED` e `ARCHIVED → PUBLISHED` envolvem `ARCHIVED`.

## Rotas

| Ação | Rota | Auditoria |
| --- | --- | --- |
| Editar título/descrição | `PATCH /api/admin/activities/[id]` | `admin.activity.update` (só os nomes dos campos) |
| Arquivar | `POST /api/admin/activities/[id]/archive` | `admin.activity.archive` |
| Restaurar | `POST /api/admin/activities/[id]/restore` | `admin.activity.restore` |
| Excluir | `DELETE /api/admin/activities/[id]` | `admin.activity.delete` |

Excluir só vale para `DRAFT`/`REJECTED` sem `DownloadHistory`,
`ActivityDownloadStat` nem `FreeSampleSelection`; senão 409
("arquive em vez de excluir").

## Arquivos no S3

- Arquivar: copia cada arquivo para `archive/<chave original>` com classe
  **GLACIER_IR** (Glacier Instant Retrieval), grava no banco (`status`,
  `isPublic=false`, `s3Key=archive/...`, `archivedFromKey=<original>`) e só
  depois apaga os originais e as prévias (`previews/v1/{fileId}-w*.webp`).
- Restaurar: copia de volta para `archivedFromKey` em **STANDARD**, grava no
  banco (`s3Key` original, `archivedFromKey=null`) e apaga as cópias de
  `archive/`. As prévias são geradas de novo na primeira visualização.
- Ordem: as cópias sempre vêm antes do banco, então um registro nunca aponta
  para um arquivo que não existe. Falha na cópia: 502, nada muda. Falha ao
  apagar depois: a ação continua com sucesso, sobra uma cópia solta e o erro
  vai para o log (`[archive] delete failed`).
- Código: `lib/files/archive.ts` (server-only), `deletePreviews` em
  `lib/files/preview.ts`.
- Mínimo de 90 dias: Glacier Instant Retrieval cobra no mínimo 90 dias de
  armazenamento. Restaurar ou excluir uma cópia arquivada antes disso é
  cobrado como se tivesse ficado os 90 dias.
- Download de arquivada: só admin (`lib/files/download.ts`). Leitura de
  Glacier IR é imediata.

## Permissões IAM

A chave da aplicação precisa de `s3:GetObject`, `s3:PutObject` e
`s3:DeleteObject` em `arn:aws:s3:::<bucket>/*` (arquivos das atividades e
`previews/*`) e em `arn:aws:s3:::<bucket>/archive/*`. Uma cópia exige leitura
na origem e escrita no destino.

## Migração

`prisma/migrations/20261120_activity_archive`: `ARCHIVED` no enum
`ActivityStatus` e `ActivityFile.archivedFromKey` (nullable). Gerada com
`prisma migrate diff`, aplicada com `prisma migrate deploy`.
