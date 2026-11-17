import { isClerkAPIResponseError } from '@clerk/nextjs/errors';

// Clerk API errors arrive in English. Map the common codes to pt-BR so users
// never see raw English messages; anything unknown falls back to a generic
// Portuguese message chosen by the caller.
const MESSAGES: Record<string, string> = {
  form_identifier_not_found: 'Não encontramos uma conta com esse email.',
  form_password_incorrect: 'Senha incorreta. Tente novamente.',
  form_identifier_exists: 'Já existe uma conta com esse email. Faça login.',
  form_password_pwned:
    'Essa senha apareceu em um vazamento de dados. Escolha outra senha.',
  form_password_length_too_short:
    'A senha precisa ter pelo menos 8 caracteres.',
  form_param_format_invalid: 'Confira o formato dos dados informados.',
  form_code_incorrect: 'Código incorreto. Confira e tente novamente.',
  verification_expired: 'O código expirou. Peça um novo código.',
  verification_failed: 'Não foi possível verificar o código. Peça um novo.',
  too_many_requests:
    'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
  session_exists: 'Você já está conectado.',
  strategy_for_user_invalid:
    'Essa conta usa outro método de acesso. Tente "Continuar com Google".',
};

export function clerkErrorMessage(err: unknown, fallback: string): string {
  if (isClerkAPIResponseError(err)) {
    const code = err.errors[0]?.code;
    if (code && MESSAGES[code]) return MESSAGES[code];
  }
  return fallback;
}
