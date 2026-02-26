
'use server';
/**
 * @fileOverview A Genkit flow for generating a factual crisis report for Juiz de Fora, MG.
 *
 * - generateCrisisReport - A function that fetches and structures real-time emergency data.
 * - AiGeneratedCrisisReportInput - The input type for the generateCrisisReport function.
 * - AiGeneratedCrisisReportOutput - The return type for the generateCrisisReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Output Schema
const AiGeneratedCrisisReportOutputSchema = z.object({
  summary: z.string().max(200).describe('Um boletim de situação factual e resumido sobre as chuvas em JF.'),
  alertLevel: z.enum(['VERDE', 'AMARELO', 'LARANJA', 'VERMELHO']).describe('O nível de alerta oficial baseado nos dados atuais.'),
  affectedAreas: z.array(z.string()).describe('Bairros ou ruas com ocorrências confirmadas.'),
  recommendations: z.array(z.string()).describe('Ações de segurança para a população.'),
  markers: z.array(z.object({
    lat: z.number().describe('Latitude da ocorrência.'),
    lng: z.number().describe('Longitude da ocorrência.'),
    description: z.string().describe('Descrição curta do que está acontecendo no local.'),
    type: z.enum(['alagamento', 'deslizamento', 'bloqueio', 'atencao']),
    severity: z.number().min(1).max(3)
  })).describe('Geolocalização precisa de pontos críticos relatados.')
});
export type AiGeneratedCrisisReportOutput = z.infer<typeof AiGeneratedCrisisReportOutputSchema>;

// Tool definition to simulate real-time data fetching
const fetchJuizDeForaCrisisData = ai.defineTool(
  {
    name: 'fetchJuizDeForaCrisisData',
    description: 'Busca dados reais e recentes sobre chuvas, alagamentos e avisos da Defesa Civil em Juiz de Fora, MG.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.string(),
  },
  async (input) => {
    // In a production environment, this would call a News API, Twitter/X API, or Defesa Civil RSS feed.
    // For the prototype, we instruct the model to use this tool to structure its "factual search" intent.
    return `Latest info for Juiz de Fora: Heavy rains in the North Zone (Benfica, Industrial). Rio Paraibuna level rising near the bridge in Santa Terezinha. Flooding reported on Avenida Brasil. Alert level Orange issued by Civil Defense.`;
  }
);

// Prompt definition
const crisisReportPrompt = ai.definePrompt({
  name: 'crisisReportPrompt',
  tools: [fetchJuizDeForaCrisisData],
  input: { schema: z.object({ currentDateTime: z.string() }) },
  output: { schema: AiGeneratedCrisisReportOutputSchema },
  prompt: `Você é um monitor de emergências da Defesa Civil de Juiz de Fora.
Sua tarefa é coletar e reportar apenas informações REAIS e ATUAIS sobre a situação climática na cidade.

1. Use a ferramenta fetchJuizDeForaCrisisData para obter o contexto mais recente.
2. Não invente bairros ou situações que não existam ou não sejam prováveis baseadas nos dados.
3. Forneça coordenadas geográficas REAIS para os marcadores (Juiz de Fora está em torno de lat: -21.76, lng: -43.35).
4. O relatório deve ser estritamente informativo.

Data/hora atual: {{{currentDateTime}}}`,
});

// Flow definition
const aiGeneratedCrisisReportFlow = ai.defineFlow(
  {
    name: 'aiGeneratedCrisisReportFlow',
    inputSchema: z.object({ currentDateTime: z.string() }),
    outputSchema: AiGeneratedCrisisReportOutputSchema,
  },
  async (input) => {
    const { output } = await crisisReportPrompt(input);
    if (!output) {
        throw new Error('Falha ao processar dados de emergência.');
    }
    return output;
  }
);

// Wrapper function for external calls
export async function generateCrisisReport(input: { currentDateTime: string }): Promise<AiGeneratedCrisisReportOutput> {
  return aiGeneratedCrisisReportFlow(input);
}
