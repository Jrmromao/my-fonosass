'use client';

import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Share2,
  Smartphone,
  Twitter,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

export default function ShareButton({
  url,
  title,
  description,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canUseNativeShare, setCanUseNativeShare] = useState(false);

  const fullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');
  const encodedUrl = encodeURIComponent(fullUrl);

  useEffect(() => {
    setCanUseNativeShare(
      typeof navigator !== 'undefined' &&
        'share' in navigator &&
        !!navigator.canShare?.({ title, text: description, url: fullUrl })
    );
  }, [title, description, fullUrl]);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: description, url: fullUrl });
      setIsOpen(false);
    } catch (err) {
      console.error('Error sharing: ', err);
    }
  };

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={
          canUseNativeShare ? handleNativeShare : () => setIsOpen(!isOpen)
        }
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-violet-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
        aria-label="Compartilhar artigo"
        aria-expanded={isOpen}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        <span className="hidden text-xs sm:inline">Compartilhar</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="absolute right-0 top-10 z-20 w-52 rounded-xl border border-neutral-200 bg-white py-2 shadow-sm"
          >
            <p className="border-b border-neutral-100 px-4 py-2 text-sm font-semibold text-violet-950">
              Compartilhar
            </p>
            <div className="py-1">
              {canUseNativeShare && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleNativeShare}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-violet-50"
                  >
                    <Smartphone className="h-4 w-4" aria-hidden />
                    Compartilhar
                  </button>
                  <div className="my-1 border-t border-neutral-100" />
                </>
              )}
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  role="menuitem"
                  onClick={() => handleShare(option.url)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-violet-50"
                >
                  <option.icon className="h-4 w-4" aria-hidden />
                  {option.name}
                </button>
              ))}
              <div className="my-1 border-t border-neutral-100" />
              <button
                type="button"
                role="menuitem"
                onClick={copyToClipboard}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-violet-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-700" aria-hidden />
                    <span className="font-medium text-green-800">
                      Link copiado
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden />
                    Copiar link
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
