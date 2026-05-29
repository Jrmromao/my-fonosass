'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';

export default function ContatoClient() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-[#f97066] font-medium uppercase tracking-wide mb-2">Contacto</p>
          <h1 className="text-3xl font-bold text-slate-900 font-display mb-2">
            Fale connosco
          </h1>
          <p className="text-sm text-gray-500">
            Tem alguma dúvida ou sugestão? Envie uma mensagem e respondemos em até 24 horas.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-lg border border-gray-100 bg-gray-50 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Mensagem enviada</h2>
            <p className="text-sm text-gray-500 mb-4">Respondemos em até 24 horas úteis.</p>
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setSubmitted(false)}
            >
              Enviar outra mensagem
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-xs text-gray-500 mb-1.5 block">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs text-gray-500 mb-1.5 block">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="assunto" className="text-xs text-gray-500 mb-1.5 block">Assunto</Label>
              <Input
                id="assunto"
                name="assunto"
                value={formData.assunto}
                onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                required
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="mensagem" className="text-xs text-gray-500 mb-1.5 block">Mensagem</Label>
              <Textarea
                id="mensagem"
                name="mensagem"
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                required
                rows={5}
                className="text-sm resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm px-6"
            >
              {isSubmitting ? 'A enviar...' : 'Enviar mensagem'}
            </Button>
          </form>
        )}

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail className="w-4 h-4" />
            <span>contato@almanaquedafala.com.br</span>
          </div>
        </div>
      </div>
    </div>
  );
}
