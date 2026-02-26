
"use client";

import { useState, useEffect, useCallback } from 'react';
import { generateCrisisReport, AiGeneratedCrisisReportOutput } from '@/ai/flows/ai-generated-crisis-report-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';

const REFRESH_INTERVAL = 10 * 60; // 10 minutes

interface AiStatusPanelProps {
  onMarkersUpdate?: (markers: AiGeneratedCrisisReportOutput['markers']) => void;
}

export default function AiStatusPanel({ onMarkersUpdate }: AiStatusPanelProps) {
  const [report, setReport] = useState<AiGeneratedCrisisReportOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const { toast } = useToast();

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const currentDateTime = new Date().toLocaleString('pt-BR');
      const data = await generateCrisisReport({ currentDateTime });
      setReport(data);
      if (onMarkersUpdate) onMarkersUpdate(data.markers);
      setStorageItem(STORAGE_KEYS.LAST_AI_REPORT, { ...data, lastUpdated: new Date().toISOString() });
      setCountdown(REFRESH_INTERVAL);
      toast({
        title: "Dados Atualizados",
        description: "Informações coletadas da rede em tempo real.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro de Conexão",
        description: "Não foi possível coletar dados externos agora.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, onMarkersUpdate]);

  useEffect(() => {
    const cached = getStorageItem<any>(STORAGE_KEYS.LAST_AI_REPORT, null);
    if (cached) {
      setReport(cached);
      if (onMarkersUpdate) onMarkersUpdate(cached.markers);
      const lastUpdate = new Date(cached.lastUpdated).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - lastUpdate) / 1000);
      setCountdown(Math.max(0, REFRESH_INTERVAL - diff));
    } else {
      fetchReport();
    }
  }, [fetchReport, onMarkersUpdate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchReport();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [fetchReport]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'VERDE': return 'bg-green-500';
      case 'AMARELO': return 'bg-yellow-500';
      case 'LARANJA': return 'bg-orange-500';
      case 'VERMELHO': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <Card className="h-full border-none shadow-none rounded-none bg-slate-900/50 backdrop-blur-md overflow-hidden flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <AlertTriangle className="text-primary w-5 h-5" />
            Dados em Tempo Real
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchReport} disabled={loading} className="h-8 w-8">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {loading && !report ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge className={`${getAlertColor(report.alertLevel)} text-white border-none px-3 py-1 font-bold`}>
                ALERTA {report.alertLevel}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Ciclo de 10min: {formatTime(countdown)}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Boletim Informativo</h4>
              <p className="text-sm leading-relaxed text-slate-300">
                {report.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Zonas com Ocorrências
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.affectedAreas.map((area, i) => (
                  <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Medidas de Segurança
              </h4>
              <ul className="space-y-2">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aguardando dados da rede...</p>
          </div>
        )}
      </CardContent>

      <div className="p-4 bg-slate-900/80 border-t text-[10px] text-muted-foreground text-center">
        Atualização automática a cada 10 minutos via monitoramento IA.
      </div>
    </Card>
  );
}
