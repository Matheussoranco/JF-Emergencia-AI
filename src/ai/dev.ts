import { config } from 'dotenv';
config({ path: '.env.local' });
config(); // fallback to .env

import '@/ai/flows/ai-generated-crisis-report-flow.ts';