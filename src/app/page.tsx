
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import AiStatusPanel from '@/components/Sidebar/AiStatusPanel';
import ReportDialog from '@/components/Reports/ReportDialog';
import DonationManager from '@/components/Donations/DonationManager';
import { CommunityReport } from '@/types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map as MapIcon, Heart, Info, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const EmergencyMap = dynamic(() => import('@/components/Map/DynamicMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center">Carregando Mapa de Emergência...</div>
});

export default function Home() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [activeTab, setActiveTab] = useState('map');
  const [layers, setLayers] = useState({
    risk: true,
    safe: true,
    donations: true,
    community: true
  });

  useEffect(() => {
    const stored = getStorageItem<CommunityReport[]>(STORAGE_KEYS.REPORTS, []);
    setReports(stored);
  }, []);

  const handleReportAdded = (report: CommunityReport) => {
    const updated = [report, ...reports];
    setReports(updated);
    setStorageItem(STORAGE_KEYS.REPORTS, updated);
  };

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <Navbar />
      
      <main className="flex-1 mt-16 pb-16 md:pb-12 flex flex-col md:flex-row relative">
        
        {/* Mobile Tabs Controller */}
        <div className="md:hidden flex p-2 bg-slate-900 border-b gap-2">
          <Button 
            variant={activeTab === 'map' ? 'default' : 'ghost'} 
            className="flex-1 text-xs h-9 gap-2" 
            onClick={() => setActiveTab('map')}
          >
            <MapIcon size={14} /> Mapa
          </Button>
          <Button 
            variant={activeTab === 'donations' ? 'default' : 'ghost'} 
            className="flex-1 text-xs h-9 gap-2" 
            onClick={() => setActiveTab('donations')}
          >
            <Heart size={14} /> Doações
          </Button>
          <Button 
            variant={activeTab === 'info' ? 'default' : 'ghost'} 
            className="flex-1 text-xs h-9 gap-2" 
            onClick={() => setActiveTab('info')}
          >
            <Info size={14} /> Info
          </Button>
        </div>

        {/* Desktop Layout: Left Info/Donations Sidebar (Collapsible) */}
        <div className="hidden lg:block w-80 border-r border-slate-800 bg-slate-900/50">
          <DonationManager />
        </div>

        {/* Main Center Content: Map */}
        <div className={`flex-1 relative ${activeTab === 'map' ? 'block' : 'hidden md:block'}`}>
          <EmergencyMap reports={reports} layers={layers} />
          
          {/* Map Layer Controls */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" className="bg-slate-900/90 border-slate-700 shadow-xl hover:bg-slate-800">
                  <Layers className="w-5 h-5 text-primary" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-slate-900/95 border-slate-700 p-4" side="right" align="start">
                <h4 className="font-bold text-sm mb-4 text-slate-100">Camadas do Mapa</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="risk" checked={layers.risk} onCheckedChange={() => toggleLayer('risk')} />
                    <Label htmlFor="risk" className="text-xs text-slate-200">Zonas de Risco (JF)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="safe" checked={layers.safe} onCheckedChange={() => toggleLayer('safe')} />
                    <Label htmlFor="safe" className="text-xs text-slate-200">Abrigos Seguros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="donations" checked={layers.donations} onCheckedChange={() => toggleLayer('donations')} />
                    <Label htmlFor="donations" className="text-xs text-slate-200">Pontos de Doação</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="community" checked={layers.community} onCheckedChange={() => toggleLayer('community')} />
                    <Label htmlFor="community" className="text-xs text-slate-200">Relatos da Comunidade</Label>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Desktop Layout: Right AI Sidebar */}
        <div className="hidden md:block w-80 lg:w-96 border-l border-slate-800">
          <AiStatusPanel />
        </div>

        {/* Mobile View Contents */}
        <div className={`flex-1 md:hidden ${activeTab === 'donations' ? 'block' : 'hidden'}`}>
          <DonationManager />
        </div>
        <div className={`flex-1 md:hidden ${activeTab === 'info' ? 'block' : 'hidden'}`}>
          <AiStatusPanel />
        </div>

        {/* Community Report Trigger */}
        <ReportDialog onReportAdded={handleReportAdded} reports={reports} />
      </main>

      <Footer />
    </div>
  );
}
