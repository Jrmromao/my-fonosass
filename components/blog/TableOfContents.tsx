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
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-2"
      >
        <span>Índice do Artigo</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <nav className="space-y-1">
          {tocItems.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToHeading(item.id)}
              className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                activeId === item.id
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
