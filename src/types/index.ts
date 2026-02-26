
export type AlertLevel = 'VERDE' | 'AMARELO' | 'LARANJA' | 'VERMELHO';

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'SAFE_ZONE' | 'DONATION_POINT' | 'RISK_ZONE';
  status?: string;
  capacity?: string;
  acceptedItems?: string[];
  address?: string;
  phone?: string;
  openHours?: string;
  lastUpdated?: string;
}

export interface RiskZone {
  id: string;
  name: string;
  coordinates: [number, number][]; // Polygon
  severity: number;
}

export interface CommunityReport {
  id: string;
  type: 'alagamento' | 'deslizamento' | 'via_bloqueada' | 'area_segura';
  description: string;
  neighborhood: string;
  severity: 1 | 2 | 3;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface CrisisReport {
  summary: string;
  alertLevel: AlertLevel;
  affectedAreas: string[];
  recommendations: string[];
  lastUpdated: string;
}
