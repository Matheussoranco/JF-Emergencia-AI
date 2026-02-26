
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertCircle, MapPin, History } from 'lucide-react';
import { JF_BAIRROS, JF_CENTER } from '@/data/seed-data';
import { CommunityReport } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReportDialogProps {
  onReportAdded: (report: CommunityReport) => void;
  reports: CommunityReport[];
}

export default function ReportDialog({ onReportAdded, reports }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: 'alagamento' as CommunityReport['type'],
    description: '',
    neighborhood: '',
    severity: '2' as '1' | '2' | '3'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.neighborhood || !formData.description) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Por favor, preencha todos os campos.' });
      return;
    }

    setLoading(true);
    
    // Simulate finding coordinates near neighborhood center (mocked for JF)
    const newReport: CommunityReport = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.type,
      description: formData.description,
      neighborhood: formData.neighborhood,
      severity: parseInt(formData.severity) as 1 | 2 | 3,
      lat: JF_CENTER.lat + (Math.random() - 0.5) * 0.05,
      lng: JF_CENTER.lng + (Math.random() - 0.5) * 0.05,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      onReportAdded(newReport);
      setLoading(false);
      setOpen(false);
      setFormData({ type: 'alagamento', description: '', neighborhood: '', severity: '2' });
      toast({ title: 'Relato Enviado', description: 'Seu relato foi publicado com sucesso no mapa.' });
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="fixed bottom-24 right-6 rounded-full shadow-2xl h-14 w-14 p-0 bg-primary hover:bg-primary/90 text-primary-foreground z-40 md:bottom-28">
          <Plus className="w-8 h-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-headline flex items-center gap-2">
            <AlertCircle className="text-primary" />
            Central de Alertas JF
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-4 border-b border-slate-800 pb-8">
            <div className="space-y-2">
              <Label>Tipo de Ocorrência</Label>
              <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectItem value="alagamento">Alagamento</SelectItem>
                  <SelectItem value="deslizamento">Deslizamento</SelectItem>
                  <SelectItem value="via_bloqueada">Via Bloqueada</SelectItem>
                  <SelectItem value="area_segura">Área Segura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Select value={formData.neighborhood} onValueChange={(v) => setFormData({...formData, neighborhood: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Bairro" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100 max-h-[200px]">
                    {JF_BAIRROS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gravidade (1-3)</Label>
                <Select value={formData.severity} onValueChange={(v: any) => setFormData({...formData, severity: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectItem value="1">Baixa</SelectItem>
                    <SelectItem value="2">Média</SelectItem>
                    <SelectItem value="3">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição da Situação</Label>
              <Textarea 
                placeholder="Ex: Água atingindo calçada na Av. Getúlio Vargas" 
                className="bg-slate-800 border-slate-700 min-h-[80px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" disabled={loading}>
              {loading ? 'Enviando...' : 'Publicar Alerta'}
            </Button>
          </form>

          <div className="space-y-4">
            <h3 className="font-headline font-semibold text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              Relatos Recentes
            </h3>
            <div className="space-y-3">
              {reports.length > 0 ? (
                reports.slice(0, 5).map((r) => (
                  <div key={r.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-primary capitalize">{r.type.replace('_', ' ')}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2">{r.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {r.neighborhood}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">Nenhum relato enviado ainda.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
