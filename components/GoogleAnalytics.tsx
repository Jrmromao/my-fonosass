"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect } from "react";

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string;
}

// Extend Window interface to include gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function GoogleAnalyticsInner({
  GA_MEASUREMENT_ID,
}: GoogleAnalyticsProps): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();

    // Push to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "pageview",
      page: url,
    });
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            cookie_domain: window.location.hostname,
            cookie_flags: window.location.protocol === 'https:' ? 'SameSite=None;Secure' : 'SameSite=Lax'
          });
        `}
      </Script>
    </>
  );
}

export default function GoogleAnalytics({
  GA_MEASUREMENT_ID,
}: GoogleAnalyticsProps): JSX.Element {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
    </Suspense>
  );
}
