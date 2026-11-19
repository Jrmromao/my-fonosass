'use client';

import { FAQ_CATEGORIES, FAQ_DATA } from '@/lib/faq';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function FAQClient() {
  const [activeCategory, setActiveCategory] = useState<string>('Geral');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const questions =
    FAQ_DATA[activeCategory as (typeof FAQ_CATEGORIES)[number]] ?? [];

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs text-coral-600 font-medium uppercase tracking-wide mb-2">
            Suporte
          </p>
          <h1 className="text-3xl font-bold text-neutral-900 font-display">
            Perguntas frequentes
          </h1>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="divide-y divide-gray-100">
          {questions.map((faq, i) => (
            <div key={i} className="py-4">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="text-sm font-medium text-neutral-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-lg bg-neutral-900 text-center">
          <h2 className="text-lg font-bold text-white mb-2">
            Ainda tem dúvidas?
          </h2>
          <p className="text-sm text-gray-400 mb-5">
            Entre em contacto connosco.
          </p>
          <Link
            href="/contato"
            className="inline-flex px-5 py-2.5 rounded-md bg-coral-500 text-white text-sm font-medium hover:bg-coral-600 transition-colors"
          >
            Fale connosco
          </Link>
        </div>
      </div>
    </div>
  );
}
