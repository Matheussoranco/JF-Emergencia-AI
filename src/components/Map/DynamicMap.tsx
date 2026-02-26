
"use client";

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { JF_CENTER, RISK_ZONES, SAFE_ZONES, DONATION_POINTS } from '@/data/seed-data';
import { CommunityReport, AiMarker } from '@/types';
import { ShieldAlert, Home, Heart, AlertTriangle, Cpu } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

const createIcon = (color: string, IconComponent: any) => {
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div style={{ backgroundColor: color }} className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg text-white">
        <IconComponent size={16} />
      </div>
      <div style={{ borderTopColor: color }} className="absolute -bottom-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]" />
    </div>
  );
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const SafeIcon = createIcon('#4CAF50', Home);
const RiskIcon = createIcon('#F23D3D', ShieldAlert);
const DonationIcon = createIcon('#55C6F7', Heart);
const ReportIcon = createIcon('#F2C317', AlertTriangle);
const AiIcon = createIcon('#F23D3D', Cpu);

interface MapProps {
  reports: CommunityReport[];
  aiMarkers?: AiMarker[];
  layers: {
    risk: boolean;
    safe: boolean;
    donations: boolean;
    community: boolean;
  };
}

export default function EmergencyMap({ reports, aiMarkers = [], layers }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center">Carregando Mapa...</div>;

  return (
    <MapContainer 
      center={[JF_CENTER.lat, JF_CENTER.lng]} 
      zoom={13} 
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {layers.risk && RISK_ZONES.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.coordinates}
          pathOptions={{
            color: zone.severity === 3 ? '#F23D3D' : '#F2C317',
            fillColor: zone.severity === 3 ? '#F23D3D' : '#F2C317',
            fillOpacity: 0.3,
            weight: 2
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-red-500">{zone.name}</h3>
              <p className="text-sm">Zona de Risco Geológico</p>
              <p className="text-xs mt-1">Severidade: {zone.severity}/3</p>
            </div>
          </Popup>
        </Polygon>
      ))}

      {layers.safe && SAFE_ZONES.map((zone) => (
        <Marker key={zone.id} position={[zone.lat, zone.lng]} icon={SafeIcon}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-green-500">{zone.name}</h3>
              <p className="text-sm text-foreground">Status: <span className="font-medium">{zone.status}</span></p>
              <p className="text-sm text-foreground">Capacidade: {zone.capacity}</p>
              <p className="text-xs text-muted-foreground mt-1">{zone.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {layers.donations && DONATION_POINTS.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lng]} icon={DonationIcon}>
          <Popup>
            <div className="p-1 min-w-[200px]">
              <h3 className="font-bold text-primary">{point.name}</h3>
              <p className="text-sm font-medium mt-1">Itens Aceitos:</p>
              <ul className="text-xs list-disc list-inside">
                {point.acceptedItems?.map(item => <li key={item}>{item}</li>)}
              </ul>
              <p className="text-xs mt-2 text-foreground">{point.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {layers.community && reports.map((report) => (
        <Marker key={report.id} position={[report.lat, report.lng]} icon={ReportIcon}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-amber-500 capitalize">{report.type.replace('_', ' ')}</h3>
              <p className="text-sm italic">{report.neighborhood}</p>
              <p className="text-sm mt-1">{report.description}</p>
              <p className="text-xs mt-2 text-muted-foreground">
                {new Date(report.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* AI Generated Real-time Markers */}
      {aiMarkers.map((marker, idx) => (
        <Marker key={`ai-${idx}`} position={[marker.lat, marker.lng]} icon={AiIcon}>
          <Popup>
            <div className="p-1 max-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="destructive" className="text-[8px] h-4 py-0">INFO IA</Badge>
                <h3 className="font-bold text-red-500 text-sm uppercase">{marker.type}</h3>
              </div>
              <p className="text-xs text-foreground font-medium">{marker.description}</p>
              <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center">
                <span className="text-[9px] text-muted-foreground">Nível de Risco: {marker.severity}/3</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
