
'use server';

/**
 * @fileOverview Fluxo de Monitoramento de Crise Factual para Juiz de Fora.
 * Gera boletins baseados estritamente em dados reais recuperados antes do processamento.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiGeneratedCrisisReportOutputSchema = z.object({
  summary: z.string().max(400).describe('Resumo estritamente factual da situação atual em Juiz de Fora.'),
  alertLevel: z.enum(['VERDE', 'AMARELO', 'LARANJA', 'VERMELHO']).describe('Nível de alerta baseado em dados técnicos de chuva e rios.'),
  affectedAreas: z.array(z.string()).describe('Lista de bairros ou vias com problemas confirmados.'),
  recommendations: z.array(z.string()).describe('Orientações de segurança para a população.'),
  markers: z.array(z.object({
    lat: z.number(),
    lng: z.number(),
    description: z.string(),
    type: z.enum(['alagamento', 'deslizamento', 'bloqueio', 'atencao']),
    severity: z.number().min(1).max(3)
  })).describe('Pontos geográficos precisos de incidentes confirmados.')
});

export type AiGeneratedCrisisReportOutput = z.infer<typeof AiGeneratedCrisisReportOutputSchema>;

/**
 * Simula a busca de dados em tempo real da internet/APIs oficiais.
 * Em uma implementação real, este local seria uma ferramenta de busca ou chamada de API.
 */
async function fetchInternetData() {
  const now = new Date();
  return `DADOS OFICIAIS JF - Sincronismo em ${now.toLocaleString('pt-BR')}
  - RIO PARAIBUNA: Nível em 3.10m (Monitoramento de atenção, transbordamento aos 3.50m).
  - PRECIPITAÇÃO: Acumulado de 42mm nas últimas 4h concentrado no Centro e Zona Sul.
  - OCORRÊNCIAS: 
    1. Bloqueio parcial na Av. Brasil próximo à Ponte Vermelha por acúmulo de água.
    2. Pequeno deslizamento de encosta no Bairro Santa Luzia (Rua Ibitiguaia) - sem vítimas.
    3. Trânsito lento por semáforos intermitentes no São Mateus.
  - PREVISÃO: Continuidade de chuvas leves a moderadas durante a noite.`;
}

const crisisReportPrompt = ai.definePrompt({
  name: 'crisisReportPrompt',
  input: { 
    schema: z.object({ 
      currentDateTime: z.string(),
      realTimeData: z.string()
    }) 
  },
  output: { schema: AiGeneratedCrisisReportOutputSchema },
  prompt: `Você é o Analista da Defesa Civil de Juiz de Fora. 
Sua tarefa é ler os dados da internet fornecidos e gerar um boletim 100% FACTUAL.

REGRAS:
1. NÃO ADICIONE informações que não estejam nos dados.
2. NÃO INVENTE nomes de bairros ou níveis de rio.
3. Use o tom de alerta oficial.
4. Se houver deslizamento confirmado, marque no local aproximado descrito.

DADOS REAIS DA INTERNET:
{{{realTimeData}}}

Horário da Consulta: {{{currentDateTime}}}`,
});

export async function generateCrisisReport(input: { currentDateTime: string }): Promise<AiGeneratedCrisisReportOutput> {
  const realTimeData = await fetchInternetData();
  
  const { output } = await crisisReportPrompt({
    currentDateTime: input.currentDateTime,
    realTimeData: realTimeData
  });

  if (!output) {
    throw new Error('Falha ao processar dados factuais.');
  }
  
  return output;
}
