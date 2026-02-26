
import { Location, RiskZone } from '@/types';

export const JF_CENTER = { lat: -21.7642, lng: -43.3503 };

export const RISK_ZONES: RiskZone[] = [
  {
    id: 'rz-1',
    name: 'Centro (Rio Paraibuna)',
    severity: 3,
    coordinates: [
      [-21.758, -43.355],
      [-21.755, -43.350],
      [-21.760, -43.345],
      [-21.765, -43.350]
    ]
  },
  {
    id: 'rz-2',
    name: 'Bairro São Mateus',
    severity: 2,
    coordinates: [
      [-21.770, -43.358],
      [-21.775, -43.355],
      [-21.772, -43.350],
      [-21.768, -43.353]
    ]
  },
  {
    id: 'rz-3',
    name: 'Santa Luzia',
    severity: 3,
    coordinates: [
      [-21.785, -43.345],
      [-21.790, -43.340],
      [-21.788, -43.335],
      [-21.782, -43.340]
    ]
  },
  {
    id: 'rz-4',
    name: 'Igrejinha',
    severity: 3,
    coordinates: [
      [-21.710, -43.410],
      [-21.715, -43.405],
      [-21.712, -43.395],
      [-21.708, -43.400]
    ]
  },
  {
    id: 'rz-5',
    name: 'Borboleta',
    severity: 2,
    coordinates: [
      [-21.750, -43.375],
      [-21.755, -43.370],
      [-21.752, -43.365],
      [-21.748, -43.370]
    ]
  },
  {
    id: 'rz-6',
    name: 'Progresso',
    severity: 2,
    coordinates: [
      [-21.740, -43.335],
      [-21.745, -43.330],
      [-21.742, -43.325],
      [-21.738, -43.330]
    ]
  }
];

export const SAFE_ZONES: Location[] = [
  {
    id: 'sz-1',
    name: 'Ginásio Municipal Jornalista Antônio Marcos',
    lat: -21.7831,
    lng: -43.3615,
    type: 'SAFE_ZONE',
    status: 'Aberto',
    capacity: '500 pessoas',
    address: 'Rua José Calil Ahouagi, 332 - Centro',
    lastUpdated: 'Agora'
  },
  {
    id: 'sz-2',
    name: 'UFJF - Faculdade de Educação Física',
    lat: -21.7761,
    lng: -43.3712,
    type: 'SAFE_ZONE',
    status: 'Aberto',
    capacity: '300 pessoas',
    address: 'Campus Universitário, s/n - Martelos',
    lastUpdated: 'Agora'
  },
  {
    id: 'sz-3',
    name: 'Escola Municipal Halfeld',
    lat: -21.7615,
    lng: -43.3482,
    type: 'SAFE_ZONE',
    status: 'Aberto',
    capacity: '200 pessoas',
    address: 'Rua Halfeld, 1179 - Centro',
    lastUpdated: 'Agora'
  }
];

export const DONATION_POINTS: Location[] = [
  {
    id: 'dp-1',
    name: 'Defesa Civil - Ponto de Coleta Central',
    lat: -21.7628,
    lng: -43.3445,
    type: 'DONATION_POINT',
    status: 'Ativo',
    acceptedItems: ['Água', 'Alimentos', 'Produtos de Higiene'],
    address: 'Avenida Brasil, 560 - Centro',
    phone: '(32) 3690-7294',
    openHours: '08:00 - 18:00',
    lastUpdated: 'Agora'
  },
  {
    id: 'dp-2',
    name: 'Câmara Municipal de Juiz de Fora',
    lat: -21.7595,
    lng: -43.3491,
    type: 'DONATION_POINT',
    status: 'Ativo',
    acceptedItems: ['Roupas', 'Colchões', 'Alimentos'],
    address: 'Rua Halfeld, 955 - Centro',
    phone: '(32) 3313-4700',
    openHours: '09:00 - 17:00',
    lastUpdated: 'Agora'
  }
];

export const JF_BAIRROS = [
  'Afonso Pena', 'Alto dos Passos', 'Bairu', 'Bandeirantes', 'Benfica', 'Bom Jardim', 
  'Bom Pastor', 'Borboleta', 'Cascatinha', 'Centro', 'Dom Bosco', 'Fábrica', 
  'Graminha', 'Igrejinha', 'Industrial', 'Linhares', 'Manoel Honório', 'Mariano Procópio', 
  'Murtinho', 'Nova Era', 'Paineiras', 'Passos', 'Poço Rico', 'Progresso', 
  'Santa Helena', 'Santa Luzia', 'Santa Terezinha', 'Santo Antônio', 'São Mateus', 
  'São Pedro', 'Teixeiras', 'Vila Ideal'
];
