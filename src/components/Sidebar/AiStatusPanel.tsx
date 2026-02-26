'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { generateCrisisReport, AiGeneratedCrisisReportOutput } from '@/ai/flows/ai-generated-crisis-report-flow';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Cpu, Radio, ShieldCheck, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';

const REFRESH_INTERVAL = 300; // 5 minutos
const MAX_HISTORY = 10;

type EnrichedReport = AiGeneratedCrisisReportOutput & { lastUpdated?: string; storageTimestamp?: string };

interface ReportDiff {
  levelChanged: boolean;
  levelUp: boolean;   // escalation
  levelDown: boolean; // improvement
  newAreas: string[];
  resolvedAreas: string[];
}

function computeDiff(current: EnrichedReport, previous: EnrichedReport): ReportDiff | null {
  const levels = ['VERDE', 'AMARELO', 'LARANJA', 'VERMELHO'];
  const curIdx  = levels.indexOf(current.alertLevel);
  const prevIdx = levels.indexOf(previous.alertLevel);
  const levelChanged = curIdx !== prevIdx;

  const curAreas  = new Set(current.affectedAreas.map(a => a.toLowerCase()));
  const prevAreas = new Set(previous.affectedAreas.map(a => a.toLowerCase()));

  const newAreas      = current.affectedAreas.filter(a => !prevAreas.has(a.toLowerCase()));
  const resolvedAreas = previous.affectedAreas.filter(a => !curAreas.has(a.toLowerCase()));

  if (!levelChanged && newAreas.length === 0 && resolvedAreas.length === 0) return null;
  return { levelChanged, levelUp: curIdx > prevIdx, levelDown: curIdx < prevIdx, newAreas, resolvedAreas };
}

interface AiStatusPanelProps {
  onMarkersUpdate?: (markers: AiGeneratedCrisisReportOutput['markers']) => void;
  onAlertChange?: (level: any) => void;
}

export default function AiStatusPanel({ onMarkersUpdate, onAlertChange }: AiStatusPanelProps) {
  const [report, setReport]           = useState<EnrichedReport | null>(null);
  const [history, setHistory]         = useState<EnrichedReport[]>([]);
  const [diff, setDiff]               = useState<ReportDiff | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [countdown, setCountdown]     = useState(REFRESH_INTERVAL);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const onMarkersUpdateRef = useRef(onMarkersUpdate);
  const onAlertChangeRef   = useRef(onAlertChange);
  useEffect(() => { onMarkersUpdateRef.current = onMarkersUpdate; }, [onMarkersUpdate]);
  useEffect(() => { onAlertChangeRef.current   = onAlertChange;   }, [onAlertChange]);

  useEffect(() => {
    if (!report) return;
    onMarkersUpdateRef.current?.(report.markers ?? []);
    onAlertChangeRef.current?.(report.alertLevel);
  }, [report]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Read current history from localStorage to get latest previous report
      const storedHistory = getStorageItem<EnrichedReport[]>(STORAGE_KEYS.REPORT_HISTORY, []);
      const prev = storedHistory[0] ?? null;

      const data = await generateCrisisReport({
        currentDateTime: new Date().toLocaleString('pt-BR'),
        previousReport: prev
          ? { when: prev.lastUpdated ?? '', alertLevel: prev.alertLevel, affectedAreas: prev.affectedAreas, summary: prev.summary }
          : null,
      });

      const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const enriched: EnrichedReport = { ...data, lastUpdated: timestamp, storageTimestamp: new Date().toISOString() };

      // Compute what changed since the last report
      const newDiff = prev ? computeDiff(enriched, prev) : null;
      setDiff(newDiff);

      // Update rolling history (newest first, cap at MAX_HISTORY)
      const updatedHistory = [enriched, ...storedHistory].slice(0, MAX_HISTORY);
      setHistory(updatedHistory);
      setStorageItem(STORAGE_KEYS.REPORT_HISTORY, updatedHistory);
      setStorageItem(STORAGE_KEYS.LAST_AI_REPORT, enriched);

      setReport(enriched);
      setCountdown(REFRESH_INTERVAL);

      const diffMsg = newDiff
        ? (newDiff.levelChanged ? ` Nível: ${prev?.alertLevel} → ${enriched.alertLevel}.` : '') +
          (newDiff.newAreas.length ? ` +${newDiff.newAreas.length} área(s).` : '') +
          (newDiff.resolvedAreas.length ? ` -${newDiff.resolvedAreas.length} resolvida(s).` : '')
        : ' Sem alterações.';
      toast({ title: 'Boletim Atualizado', description: `Fatos das ${timestamp}.${diffMsg}` });
    } catch (err: any) {
      const msg = err?.message ?? '';
      let userMsg = 'Falha ao atualizar dados. Tente novamente.';
      let toastDesc = 'Servidor sobrecarregado ou chave de API inválida.';

      if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403') || msg.includes('GOOGLE_GENAI_API_KEY')) {
        userMsg = 'Chave da API Gemini não configurada ou inválida.';
        toastDesc = 'Configure GOOGLE_GENAI_API_KEY no arquivo .env.local e reinicie o servidor.';
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('ECONNREFUSED')) {
        userMsg = 'Erro de conexão com o servidor de IA.';
        toastDesc = 'Verifique sua conexão de internet e tente novamente.';
      } else if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        userMsg = 'Limite de requisições da API excedido.';
        toastDesc = 'Aguarde alguns minutos e tente novamente.';
      }

      setError(userMsg);
      toast({ variant: 'destructive', title: 'Erro de Sincronismo', description: toastDesc });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load cached report + history on mount
  useEffect(() => {
    const storedHistory = getStorageItem<EnrichedReport[]>(STORAGE_KEYS.REPORT_HISTORY, []);
    const cached = storedHistory[0] ?? getStorageItem<EnrichedReport>(STORAGE_KEYS.LAST_AI_REPORT, null as unknown as EnrichedReport);

    if (storedHistory.length > 0) setHistory(storedHistory);

    if (cached?.storageTimestamp) {
      const ageSec = Math.floor((Date.now() - new Date(cached.storageTimestamp).getTime()) / 1000);
      const remaining = Math.max(0, REFRESH_INTERVAL - ageSec);
      setReport(cached);
      setCountdown(remaining);
      if (remaining <= 0) fetchReport();
    } else {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return REFRESH_INTERVAL;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger fetch when countdown hits zero (decoupled from the interval)
  useEffect(() => {
    if (countdown === REFRESH_INTERVAL && !loading && report) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const levelColor = (l: string) => {
    switch (l) {
      case 'VERDE':    return 'text-emerald-400 border-emerald-700 bg-emerald-950/40';
      case 'AMARELO':  return 'text-amber-400 border-amber-700 bg-amber-950/40';
      case 'LARANJA':  return 'text-orange-400 border-orange-700 bg-orange-950/40';
      case 'VERMELHO': return 'text-red-400 border-red-700 bg-red-950/40';
      default:         return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-5 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
          <Cpu className="text-red-600" /> MONITORAMENTO IA
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchReport} 
          disabled={loading} 
          className="h-8 w-8 text-slate-500"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
        </Button>
      </div>

      {loading && !report ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full bg-slate-800/50" />
          <Skeleton className="h-40 w-full bg-slate-800/50" />
        </div>
      ) : error ? (
        <div className="p-10 text-center text-slate-500 text-[10px] font-black uppercase flex flex-col items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <span className="text-amber-500">{error}</span>
          <Button variant="outline" size="sm" onClick={fetchReport}>Tentar Novamente</Button>
        </div>
      ) : report ? (
        <div className="space-y-5">
          {/* Alert level + timer */}
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-inner">
            <Badge className={`font-black text-[10px] uppercase px-2 py-1 border ${levelColor(report.alertLevel)}`}>
              ALERTA {report.alertLevel}
            </Badge>
            <div className="flex flex-col items-end gap-0.5">
               <span className="text-[9px] font-mono text-slate-500 uppercase">Sinc: {formatTime(countdown)}</span>
               <span className="text-[8px] font-black text-emerald-500/70 uppercase">Fatos das {report.lastUpdated}</span>
            </div>
          </div>

          {/* Diff banner — only when something actually changed */}
          {diff && (
            <div className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase flex flex-col gap-1 ${
              diff.levelUp ? 'border-red-700 bg-red-950/30 text-red-400' :
              diff.levelDown ? 'border-emerald-700 bg-emerald-950/30 text-emerald-400' :
              'border-slate-700 bg-slate-900 text-slate-400'
            }`}>
              <span className="flex items-center gap-1">
                {diff.levelUp    && <TrendingUp  size={12} />}
                {diff.levelDown  && <TrendingDown size={12} />}
                {!diff.levelChanged && <Minus size={12} />}
                {diff.levelChanged
                  ? `Nível de alerta ${diff.levelUp ? 'elevado' : 'reduzido'}: ${history[1]?.alertLevel} → ${report.alertLevel}`
                  : 'Nível de alerta inalterado'}
              </span>
              {diff.newAreas.length > 0 && (
                <span className="text-orange-400">⬆ Nova(s): {diff.newAreas.join(', ')}</span>
              )}
              {diff.resolvedAreas.length > 0 && (
                <span className="text-emerald-400">⬇ Resolvida(s): {diff.resolvedAreas.join(', ')}</span>
              )}
            </div>
          )}

          {/* Summary */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Radio size={12} className="text-red-600" /> Boletim em Tempo Real
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-semibold">
                {report.summary}
              </p>
            </CardContent>
          </Card>

          {/* Affected areas */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={12} className="text-red-600" /> Áreas Afetadas
            </h3>
            {report.affectedAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.affectedAreas.map((area, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] bg-slate-900 border-slate-800 text-slate-400 font-bold uppercase">
                    {area}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase">
                <CheckCircle2 size={14} /> Nenhuma área com incidentes confirmados
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500" /> Recomendações
            </h3>
            <ul className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="text-[11px] text-slate-300 flex gap-2 leading-tight font-medium">
                  <span className="text-red-600 font-black">•</span> {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* History timeline */}
          {history.length > 1 && (
            <div className="pt-2 border-t border-slate-800">
              <button
                className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 uppercase hover:text-slate-300 transition-colors py-1"
                onClick={() => setShowHistory(h => !h)}
              >
                <span>Histórico ({history.length - 1} boletins anteriores)</span>
                {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showHistory && (
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                  {history.slice(1).map((h, i) => (
                    <div key={i} className="bg-slate-900/60 rounded-lg border border-slate-800 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={`text-[8px] font-black uppercase px-1.5 py-0 border ${levelColor(h.alertLevel)}`}>
                          {h.alertLevel}
                        </Badge>
                        <span className="text-[8px] font-mono text-slate-600">{h.lastUpdated}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug line-clamp-3">{h.summary}</p>
                      {h.affectedAreas.length > 0 && (
                        <p className="text-[9px] text-slate-600 mt-1">
                          Áreas: {h.affectedAreas.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-10 text-center text-slate-500 text-[10px] font-black uppercase flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 opacity-20" />
          Carregando fatos...
        </div>
      )}
    </div>
  );
}
