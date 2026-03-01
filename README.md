<!-- ═══════════════════════════════════════════════════════════════════ -->
> [!NOTE]
> **⚠️ APLICAÇÃO ARQUIVADA**
>
>Este repositório está **arquivado** e não receberá novas atualizações.
> Aplicações especializadas de acompanhamento de doações e de cadastro de desabrigados realizam esse papel com muito mais eficiência do que uma ferramenta de monitoramento em tempo real como esta.
>
> O código é aberto, documentado e pode ser reutilizado integralmente ou em partes para outros municípios ou eventos climáticos futuros. Fique à vontade para fazer um fork.
<!-- ═══════════════════════════════════════════════════════════════════ -->

---

# JF Alerta 🚨

**Sistema de monitoramento de chuvas e enchentes em tempo real para Juiz de Fora, MG.**

Construído em resposta às cheias que atingiram a cidade, o JF Alerta agrega dados de 7 fontes meteorológicas e hidrológicas oficiais, gera boletins de situação com Inteligência Artificial, exibe zonas de risco no mapa e permite que qualquer cidadão reporte um incidente diretamente do campo — com GPS, foto e descrição — sem qualquer cadastro.

---

## Sumário

1. [Motivação](#motivação)
2. [Funcionalidades](#funcionalidades)
3. [Fontes de dados](#fontes-de-dados)
4. [Arquitetura de IA](#arquitetura-de-ia)
5. [Mapa interativo](#mapa-interativo)
6. [Relatos comunitários](#relatos-comunitários)
7. [Stack técnica](#stack-técnica)
8. [Estrutura do projeto](#estrutura-do-projeto)
9. [Instalação local](#instalação-local)
10. [Variáveis de ambiente](#variáveis-de-ambiente)
11. [Scripts disponíveis](#scripts-disponíveis)
12. [Deploy](#deploy)
13. [Decisões de arquitetura](#decisões-de-arquitetura)
14. [Licença](#licença)

---

## Motivação

Durante eventos de chuva extrema, informações dispersas em diferentes portais governamentais, redes sociais e canais de emergência dificultam a tomada de decisão tanto para a Defesa Civil quanto para a população. O JF Alerta nasce como uma camada de síntese: coleta dados brutos de APIs públicas, processa tudo com um modelo de linguagem e entrega um boletim único, atualizado e geolocalizável para qualquer pessoa com um celular e conexão à internet.

---

## Funcionalidades

### Boletim de IA
- Gerado automaticamente pelo **Gemini 2.5 Flash** com ingestão paralela de 7 fontes de dados reais
- Nível de alerta dinâmico em 4 estágios: `VERDE` → `AMARELO` → `LARANJA` → `VERMELHO`
- **Anti-repetição**: cada boletim compara o relatório anterior e usa os prefixos `ATUALIZAÇÃO` ou `estável` para indicar evolução da situação
- Histórico rolante dos últimos 10 boletins com cálculo de diff automático (▲ piora / ▼ melhora)
- Banner de tendência com ícones TrendingUp / TrendingDown entre boletins consecutivos
- Marcadores de incidentes georreferenciados gerados pela IA e plotados diretamente no mapa

### Alertas e notificações
- **Notificações push no navegador** quando o nível de alerta escala (requer permissão do usuário)
- Indicador de conectividade online/offline em tempo real na barra de navegação

### Mapa interativo
- Zonas de risco com raio geográfico real em metros, escalável com o zoom
- Áreas seguras e pontos de coleta de doações
- Relatos comunitários e marcadores da IA sobrepostos em camadas separadas (toggle por LayersControl)
- **3 camadas base**: OpenStreetMap, CartoDB Dark Matter, Esri World Imagery (Satélite)
- Troca de camada base via seletor customizado — sem bugs do `LayersControl.BaseLayer` do react-leaflet v5
- Botão "Minha localização" com fallback gracioso para geolocalização negada
- Toggle entre mapa interativo (Leaflet) e **mapa oficial da Prefeitura** (Google My Maps embed), com o Leaflet sempre montado em background para evitar erros de reinicialização
- Widget de clima atual sobreposto ao mapa, atualizado a cada 5 minutos via Open-Meteo

### Relatos comunitários
- Formulário modal com: tipo de incidente, bairro (lista curada de JF), severidade, descrição livre
- **Captura de GPS real** com precisão em metros — exibe badge `±Xm` no relato
- Fallback automático para coordenada central do bairro quando GPS não está disponível
- **Foto direta da câmera** (mobile) ou do disco (desktop), comprimida para até 3 MB, armazenada como base64
- Preview da foto no formulário antes de enviar
- Lightbox para expandir fotos nos relatos listados
- **Upvotes** para confirmar relatos de terceiros

### Aba SOS
- 6 contatos de emergência com discagem direta (toque = ligar): SAMU, Bombeiros, Defesa Civil, entre outros
- SMS Defesa Civil: **40199**
- Links para portais oficiais da Prefeitura e Defesa Civil de JF
- Dicas de segurança em caso de enchente

### Interface mobile-first
- Design dark responsivo — pensado para uso em campo, sob chuva, com tela molhada
- **Bottom sheet** deslizante no mobile: inicia fechado (mapa em tela cheia), abre ao tocar em qualquer aba, fecha ao tocar na aba ativa novamente ou no botão de fechar
- FAB (`+`) flutua acima do bottom sheet quando aberto
- Data e hora ao vivo na navbar

---

## Fontes de dados

Todas as fontes são **gratuitas e sem autenticação obrigatória** (exceto Climatempo, que é opcional).

| Fonte | Endpoint | Dados coletados |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | `api.open-meteo.com/v1/forecast` | Temperatura atual, precipitação acumulada (1h/6h/24h), velocidade do vento, código WMO |
| [INMET Alertas](https://portal.inmet.gov.br) | `apitempo.inmet.gov.br/api/v3/avisos/0/MG` | Alertas meteorológicos oficiais ativos para Minas Gerais |
| [INMET Previsão](https://portal.inmet.gov.br) | `apiprevmet3.inmet.gov.br/api/forecast/3136702` | Previsão 7 dias para Juiz de Fora (código IBGE 3136702) |
| [CEMADEN](https://www.cemaden.gov.br) | `servicios.cptec.inpe.br/…/pluviometros/…` | Acumulado pluviométrico nas estações do município |
| [ANA Telemetria](https://www.snirh.gov.br/hidroweb) | `telemetriaws.ana.gov.br/ServiceANA.asmx` | Nível (cotas) e chuva do Rio Paraibuna — Estação 58082000 |
| [Climatempo](https://www.climatempo.com.br) | `apiadvisor.climatempo.com.br/…` | Previsão detalhada + condição atual *(opcional — requer token)* |
| Google Search Grounding | Integrado ao Gemini via `googleSearchRetrieval` | Notícias, posts e alertas em tempo real sobre chuvas em JF |

---

## Arquitetura de IA

O flow principal (`ai-generated-crisis-report-flow.ts`) é executado no servidor (Next.js Route Handler via Genkit) e segue esta sequência:

```
Requisição do cliente
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Promise.allSettled  (7 buscas paralelas, timeout 8s cada) │
│                                                           │
│  ┌──────────┐ ┌─────────────┐ ┌─────────┐ ┌──────────┐  │
│  │Open-Meteo│ │INMET Alertas│ │INMET 7d │ │ CEMADEN  │  │
│  └──────────┘ └─────────────┘ └─────────┘ └──────────┘  │
│  ┌────────────────┐ ┌────────────────┐ ┌──────────────┐  │
│  │ ANA Rio        │ │  Climatempo    │ │Google Search │  │
│  │ Paraibuna      │ │  (opcional)    │ │(Gemini nativo│  │
│  └────────────────┘ └────────────────┘ └──────────────┘  │
└───────────────────────────────────────────────────────────┘
        │
        ▼
  Dados brutos concatenados em contexto estruturado
  + relatório anterior (parâmetro anti-repetição)
        │
        ▼
  Prompt com 9 regras de formatação
        │
        ▼
  gemini-2.5-flash  (googleSearchRetrieval: true)
        │
        ▼
  JSON estruturado:
  { report, alertLevel, markers[], timestamp }
        │
        ▼
  Cliente atualiza mapa, nível de alerta e histórico
```

O modelo recebe o relatório anterior e é instruído a usar o prefixo `ATUALIZAÇÃO:` quando há mudança relevante, ou `situação estável` quando os dados são similares — evitando boletins idênticos a cada refresh.

---

## Mapa interativo

Implementado com **react-leaflet v5** sobre **Leaflet 1.9.4**.

**Camadas de overlay (toggle individual via LayersControl.Overlay):**
- ⚠️ Zonas de Risco — `Circle` com raio em metros, cor por severidade (1/2/3), tooltip permanente
- 🏠 Áreas Seguras — marcadores customizados com `L.divIcon` + `renderToStaticMarkup`
- ❤️ Pontos de Doação
- 📍 Relatos Comunitários (ícone com cor por severidade + popup com detalhes)
- 🤖 Marcadores da IA (ícone roxo, gerado pelo boletim)

**Camadas base (seletor customizado — fora do LayersControl para evitar bug de `getPane()` no react-leaflet v5):**
- OpenStreetMap
- CartoDB Dark Matter
- Esri World Imagery (Satélite)

**Controles:**
- `ZoomControl` reposicionado para `bottomleft`
- `LocateControl` customizado usando `navigator.geolocation`
- `TilePicker` — botões posicionados em `bottomright` via `useMap` + `L.Control`

---

## Relatos comunitários

Os dados são persistidos no **`localStorage` do navegador** sob a chave `jf_alerta_reports`. Não há banco de dados externo ou autenticação. Isso garante:

- Funcionamento mesmo com conectividade intermitente
- Zero custo de infraestrutura de escrita
- Privacidade (os dados não saem do dispositivo do usuário)

O histórico de boletins da IA também é armazenado localmente (`jf_alerta_report_history`), com limite de 10 entradas.

---

## Stack técnica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 15.5.x |
| UI | React | 19 |
| Estilização | Tailwind CSS + shadcn/ui | — |
| Mapa | react-leaflet + Leaflet | v5 / 1.9.4 |
| IA — orquestração | Google Genkit | v1 |
| IA — modelo | Gemini 2.5 Flash | — |
| Deploy | Firebase App Hosting | — |
| Linguagem | TypeScript (strict) | 5.x |

---

## Estrutura do projeto

```
src/
├── ai/
│   ├── genkit.ts                               # Inicialização Genkit + plugin Google AI
│   └── flows/
│       └── ai-generated-crisis-report-flow.ts  # Flow principal: 7 fontes → boletim IA
│
├── app/
│   ├── layout.tsx                              # Root layout (fontes, metadados)
│   └── page.tsx                               # Página principal: mapa + abas + bottom sheet
│
├── components/
│   ├── Layout/
│   │   ├── Navbar.tsx          # Barra superior: alerta, data/hora, indicador online
│   │   └── Footer.tsx
│   ├── Map/
│   │   ├── DynamicMap.tsx      # Mapa Leaflet (carregado com next/dynamic, ssr: false)
│   │   └── WeatherWidget.tsx   # Widget clima sobreposto ao mapa (Open-Meteo, 5 min)
│   ├── Reports/
│   │   └── ReportModal.tsx     # Modal de novo relato: GPS + foto + formulário
│   └── Sidebar/
│       ├── AiStatusPanel.tsx   # Painel IA: boletim, histórico rolante, diff, marcadores
│       └── EmergencyContacts.tsx  # Aba SOS: contatos, SMS 40199, dicas de segurança
│
├── data/
│   └── seed-data.ts            # RISK_ZONES, SAFE_ZONES, DONATION_POINTS, BAIRRO_COORDS
│
├── hooks/
│   ├── use-alert-notifications.ts   # Notificações push por escalada de alerta
│   └── use-online-status.ts         # Detector online/offline (navigator.onLine)
│
├── lib/
│   └── storage.ts              # Wrapper localStorage tipado (get/set com fallback)
│
└── types/
    └── index.ts                # CommunityReport, AiMarker, AlertLevel, Location, etc.
```

---

## Instalação local

```bash
# 1. Clone o repositório
git clone https://github.com/Matheussoranco/JF-Emergencia-AI.git
cd JF-Emergencia-AI

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local e preencha GOOGLE_GENAI_API_KEY

# 4. Suba o servidor de desenvolvimento
npm run dev
# Acesse http://localhost:9002
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GOOGLE_GENAI_API_KEY` | ✅ Sim | Chave da Google AI Studio — usada pelo Genkit para chamar o Gemini |
| `CLIMATEMPO_API_TOKEN` | ❌ Opcional | Token da API Climatempo — se ausente, a fonte é ignorada silenciosamente |

Obtenha a chave Gemini em [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — a camada gratuita é suficiente para uso individual.

---

## Scripts disponíveis

```bash
npm run dev           # Dev server com Turbopack (porta 9002)
npm run build         # Build de produção otimizado
npm run start         # Servidor de produção local
npm run typecheck     # Verificação de tipos TypeScript sem emitir arquivos
npm run genkit:dev    # Genkit Developer UI para inspecionar e testar flows de IA
```

---

## Deploy

O projeto está configurado para **Firebase App Hosting** com deploy automático a cada push na branch `main`.

```bash
git push origin main   # dispara o pipeline de CI/CD automaticamente
```

Para rodar em outro provedor (Vercel, Railway, etc.), o único pré-requisito é definir `GOOGLE_GENAI_API_KEY` nas variáveis de ambiente do servidor — o restante é Next.js padrão.

---

## Decisões de arquitetura

**Por que localStorage e não um banco de dados?**
O objetivo era zero custo de operação e zero fricção de uso. Um banco de dados exigiria autenticação, regras de segurança e latência de rede. Para um evento de emergência de curta duração, os relatos no dispositivo do usuário são suficientes — e funcionam offline.

**Por que Genkit em vez de chamar o Gemini diretamente?**
O Genkit oferece observabilidade (traces, inputs/outputs logados), tipagem forte dos flows com Zod e facilidade para testar os prompts isoladamente via Developer UI. A troca de modelo em produção se torna uma mudança de uma linha.

**Por que `LayersControl.BaseLayer` foi removido?**
O react-leaflet v5 quebrou o suporte a `LayersControl.BaseLayer` — a camada filha tenta acessar `this.getPane()` antes do pane existir, lançando cascata de três erros de runtime. A solução foi um `<TileLayer>` único com URL dirigida por estado (`tileId`) + seletor customizado implementado como `L.Control`.

**Por que o Leaflet nunca é desmontado?**
Alternar a visibilidade do contêiner Leaflet (via `display:none` ou `opacity: 0`) força o Leaflet a tentar reinicializar o mapa no mesmo elemento DOM, lançando `Map container is being reused by another instance`. A solução adotada mantém o Leaflet sempre montado e sobrepõe o iframe do mapa oficial via `z-index` quando necessário.

---

## Licença

MIT © 2025 — Matheus Soranço