
"use client";

import { ShieldAlert, Settings, Bell, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AiStatusPanel from '@/components/Sidebar/AiStatusPanel';

export default function Navbar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="h-16 border-b bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 fixed top-0 w-full z-50">
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <ShieldAlert className="text-primary w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-headline font-black tracking-tighter text-slate-50 uppercase leading-none">
            JF Alerta
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
            Emergência Juiz de Fora
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <div className="flex flex-col items-end">
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-2 py-0 h-5">
            Monitoramento Ativo
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">Última atualização: {time}</span>
        </div>
        <div className="h-8 w-[1px] bg-slate-800" />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="md:hidden flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary">
              <Bell className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-3xl border-slate-800 bg-slate-950">
            <AiStatusPanel />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
