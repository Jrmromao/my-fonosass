'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Extract headings from content
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, ''); // Remove HTML tags
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      headings.push({ id, text, level });
    }

    setTocItems(headings);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = tocItems
        .map((item) => document.getElementById(item.id))
        .filter(Boolean);

      const current = headingElements.find((heading) => {
        if (!heading) return false;
        const rect = heading.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (current) {
        setActiveId(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 flex w-full items-center justify-between text-left text-sm font-semibold text-violet-950"
      >
        <span>Índice do artigo</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden />
        )}
      </button>

      {isOpen && (
        <nav className="space-y-1">
          {tocItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToHeading(item.id)}
              className={`block w-full rounded-md py-1 px-2 text-left text-sm transition-colors ${
                activeId === item.id
                  ? 'bg-sun-100 font-medium text-violet-950'
                  : 'text-neutral-600 hover:bg-violet-50 hover:text-neutral-900'
              }`}
              style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
            >
              {item.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
