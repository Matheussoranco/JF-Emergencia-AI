
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

const REFRESH_INTERVAL = 10 * 60; // 10 minutes in seconds

export default function AiStatusPanel() {
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
      setStorageItem(STORAGE_KEYS.LAST_AI_REPORT, { ...data, lastUpdated: new Date().toISOString() });
      setCountdown(REFRESH_INTERVAL);
      toast({
        title: "Boletim Atualizado",
        description: "As informações da IA foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro na Atualização",
        description: "Serviço temporariamente indisponível. Consulte a Defesa Civil de JF.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const cached = getStorageItem<any>(STORAGE_KEYS.LAST_AI_REPORT, null);
    if (cached) {
      setReport(cached);
      // Calculate remaining time
      const lastUpdate = new Date(cached.lastUpdated).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - lastUpdate) / 1000);
      setCountdown(Math.max(0, REFRESH_INTERVAL - diff));
    } else {
      fetchReport();
    }
  }, [fetchReport]);

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
      case 'VERDE': return 'bg-green-500 hover:bg-green-600';
      case 'AMARELO': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'LARANJA': return 'bg-orange-500 hover:bg-orange-600';
      case 'VERMELHO': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-slate-500';
    }
  };

  return (
    <Card className="h-full border-none shadow-none rounded-none bg-slate-900/50 backdrop-blur-md overflow-hidden flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <AlertTriangle className="text-primary w-5 h-5" />
            Situação em Tempo Real
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
                Próxima atualização em {formatTime(countdown)}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Resumo da Situação</h4>
              <p className="text-sm leading-relaxed text-slate-300">
                {report.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Áreas Afetadas
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
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Recomendações
              </h4>
              <ul className="space-y-2">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-primary">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum dado disponível.</p>
            <Button variant="link" onClick={fetchReport}>Tentar novamente</Button>
          </div>
        )}
      </CardContent>

      <div className="p-4 bg-slate-900/80 border-t text-[10px] text-muted-foreground text-center">
        Informações geradas por IA. Em caso de emergência, ligue 193 ou 199.
      </div>
    </Card>
  );
}
