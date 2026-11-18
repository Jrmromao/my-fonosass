import * as Sentry from '@sentry/nextjs';
import { getSentryOptions } from '@/lib/monitoring/sentryOptions';

const options = getSentryOptions();
if (options) Sentry.init(options);
