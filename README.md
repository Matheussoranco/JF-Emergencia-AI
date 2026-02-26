# JF Alerta 🚨

Sistema de monitoramento de chuvas e enchentes em tempo real para **Juiz de Fora, MG**. Agrega dados de múltiplas fontes oficiais, gera boletins de crise com IA e permite que a comunidade reporte incidentes diretamente do campo.

---

## Funcionalidades

### Monitoramento IA
- Boletins gerados automaticamente pelo **Gemini 2.5 Flash** com dados reais de 7 fontes paralelas
- Nível de alerta dinâmico: VERDE / AMARELO / LARANJA / VERMELHO
- Notificações push no navegador quando o nível escala
- Marcadores geolocalizados de incidentes confirmados no mapa

### Fontes de Dados (todas gratuitas)
| Fonte | Dados |
|---|---|
| [Open-Meteo](https://open-meteo.com) | Temperatura, precipitação atual e acumulados |
| [INMET Alertas](https://portal.inmet.gov.br) | Alertas meteorológicos oficiais para MG |
| [INMET Previsão](https://portal.inmet.gov.br) | Previsão 7 dias para JF (IBGE 3136702) |
| [CEMADEN](https://www.cemaden.gov.br) | Acumulado pluviométrico nas estações de JF |
| [ANA Telemetria](https://www.snirh.gov.br/hidroweb) | Nível e chuva do Rio Paraibuna (Estação 58082000) |
| [Climatempo](https://www.climatempo.com.br) | Previsão + clima atual *(opcional — token)* |
| Google Search Grounding | Notícias e alertas em tempo real via Gemini |

### Mapa Interativo
- Zonas de risco com raio geográfico real (metros) escalável com o zoom
- Áreas seguras e pontos de doação
- Relatos da comunidade e marcadores da IA
- 3 camadas base: OpenStreetMap, **CartoDB Dark Matter**, Esri Satellite
- Botão "Minha localização" (📍) para centralizar o mapa no usuário

### Relatos Comunitários
- Tipo de incidente, bairro, severidade e descrição
- **GPS com precisão em metros** — coordenada real capturada pelo dispositivo
- Fallback automático para o centróide do bairro selecionado
- **Foto direta da câmera** (até 3 MB) com preview e lightbox
- Upvotes para confirmar relatos de terceiros
- Badge de precisão GPS e indicador de foto na lista

### Aba SOS
- 6 números de emergência com discagem direta (toque = ligar)
- SMS Defesa Civil: **40199**
- Links para Defesa Civil JF, Bombeiros, SAMU e Prefeitura
- Dicas de segurança em caso de enchente

### Interface
- Design dark responsivo — mobile-first
- Indicador online/offline em tempo real na barra de navegação
- Widget de clima atual sobreposto ao mapa (atualiza a cada 5 min)
- Data e hora ao vivo na navbar

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS + shadcn/ui |
| Mapa | react-leaflet v5 + Leaflet v1.9 |
| IA | Google Genkit v1 + Gemini 2.5 Flash |
| Deploy | Firebase App Hosting |
| Linguagem | TypeScript strict |

---

## Instalação Local

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd studio

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local e preencha GOOGLE_GENAI_API_KEY

# 4. Suba o servidor de desenvolvimento
npm run dev
# Acesse http://localhost:9002
```

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GOOGLE_GENAI_API_KEY` | ✅ Sim | Chave da API Google AI Studio |
| `CLIMATEMPO_API_TOKEN` | ❌ Opcional | Token Climatempo para previsão extra |

Obtenha a chave em [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

---

## Scripts

```bash
npm run dev          # Dev server (Turbopack, porta 9002)
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run typecheck    # Verificação de tipos TypeScript
npm run genkit:dev   # Genkit UI para testar os flows de IA
```

---

## Deploy (Firebase App Hosting)

1. Defina `GOOGLE_GENAI_API_KEY` no console do Firebase App Hosting
2. Faça push para a branch `main` — o deploy acontece automaticamente

```bash
git push origin main
```

---

## Estrutura do Projeto

```
src/
├── ai/
│   ├── genkit.ts                          # Configuração Genkit + plugin Google AI
│   └── flows/
│       └── ai-generated-crisis-report-flow.ts  # 7 fontes paralelas → relatório IA
├── app/
│   └── page.tsx                           # Página principal (mapa + abas + FAB)
├── components/
│   ├── Layout/       Navbar, Footer
│   ├── Map/          DynamicMap, WeatherWidget
│   ├── Reports/      ReportModal (GPS + foto)
│   └── Sidebar/      AiStatusPanel, EmergencyContacts
├── data/
│   └── seed-data.ts  # Zonas de risco, áreas seguras, doações, BAIRRO_COORDS
├── hooks/
│   ├── use-alert-notifications.ts  # Push notifications por escalada de alerta
│   └── use-online-status.ts        # Detector online/offline
├── lib/
│   └── storage.ts    # Wrapper localStorage tipado
└── types/
    └── index.ts      # CommunityReport, AiMarker, AlertLevel, etc.
```

---

## Dados Locais

Os relatos da comunidade são persistidos no **localStorage** do navegador — não há banco de dados externo. Isso garante funcionamento offline parcial e zero custo de infraestrutura de escrita.

---

## Licença

MIT
