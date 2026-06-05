export interface CommunityAnalysis {
  title: string;
  entry: string;
  sl: string;
  target1: string;
  target2: string;
  disclaimer: string;
  customerCare: string;
  rationale: string;
  confidence: string;
  id: string;
  tag: string;
  time: string;
}

export interface SubCommunity {
  id: number;
  name: string;
  members: string;
  type: 'Free' | 'Paid';
}

export interface Community {
  id: number;
  name: string;
  members: string;
  time: string;
  views: string;
  pinned: string;
  analysis: CommunityAnalysis;
  subCommunities?: SubCommunity[];
}

export const DISCLAIMER =
  'Disclaimer: Investments in the market are subject to market risk. Please read all related documents carefully before investing. Registration granted by SEBI, Enlistment as RA with Exchange and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.';

export const COMMUNITIES: Community[] = [
  {
    id: 1,
    name: 'Nifty & Bank Nifty',
    members: '12.4k',
    time: '10:42 AM',
    views: '24.5k',
    pinned: 'Bank Nifty 44200 CE Buy Above 250',
    subCommunities: [
      { id: 101, name: 'NF1', members: '5.2k', type: 'Free' },
      { id: 102, name: 'NF2', members: '4.1k', type: 'Free' },
      { id: 103, name: 'NP1', members: '3.1k', type: 'Paid' },
    ],
    analysis: {
      title: 'BUY NIFTY 12 MAY 24100 PE',
      entry: '180',
      sl: '165',
      target1: '195',
      target2: '210',
      disclaimer: DISCLAIMER,
      customerCare: '77380 63455',
      rationale: 'https://bit.ly/4tBVOrE',
      confidence: 'Medium probability',
      id: '123',
      tag: 'Nifty',
      time: '10:45 AM',
    },
  },
  {
    id: 2,
    name: 'Equity Options',
    members: '8.2k',
    time: '10:42 AM',
    views: '11.2k',
    pinned: 'RELIANCE 2900 CE Buy Above 42',
    subCommunities: [
      { id: 201, name: 'EF1', members: '3.8k', type: 'Free' },
      { id: 202, name: 'EF2', members: '2.5k', type: 'Free' },
      { id: 203, name: 'EP1', members: '1.9k', type: 'Paid' },
    ],
    analysis: {
      title: 'BUY RELIANCE 2900 CE',
      entry: '42',
      sl: '36',
      target1: '50',
      target2: '58',
      disclaimer: DISCLAIMER,
      customerCare: '77380 63455',
      rationale: 'https://bit.ly/4tBVOrE',
      confidence: 'High probability',
      id: '124',
      tag: 'Equity',
      time: '10:38 AM',
    },
  },
  {
    id: 3,
    name: 'Commodities',
    members: '5.1k',
    time: '10:42 AM',
    views: '6.8k',
    pinned: 'GOLD MINI Buy Above 71500',
    subCommunities: [
      { id: 301, name: 'CF1', members: '2.9k', type: 'Free' },
      { id: 302, name: 'CF2', members: '1.4k', type: 'Free' },
      { id: 303, name: 'CP1', members: '0.8k', type: 'Paid' },
    ],
    analysis: {
      title: 'BUY GOLD MINI FUT',
      entry: '71500',
      sl: '71200',
      target1: '71900',
      target2: '72300',
      disclaimer: DISCLAIMER,
      customerCare: '77380 63455',
      rationale: 'https://bit.ly/4tBVOrE',
      confidence: 'Medium probability',
      id: '125',
      tag: 'Commodity',
      time: '10:30 AM',
    },
  },
  {
    id: 4,
    name: 'Swing Trades',
    members: '15k',
    time: '10:42 AM',
    views: '31.0k',
    pinned: 'TATAMOTORS Positional Buy 980',
    subCommunities: [
      { id: 401, name: 'STF1', members: '6.2k', type: 'Free' },
      { id: 402, name: 'STF2', members: '5.1k', type: 'Free' },
      { id: 403, name: 'STP1', members: '3.7k', type: 'Paid' },
    ],
    analysis: {
      title: 'BUY TATAMOTORS CASH',
      entry: '980',
      sl: '940',
      target1: '1040',
      target2: '1100',
      disclaimer: DISCLAIMER,
      customerCare: '77380 63455',
      rationale: 'https://bit.ly/4tBVOrE',
      confidence: 'High probability',
      id: '126',
      tag: 'Swing',
      time: '09:45 AM',
    },
  },
  {
    id: 5,
    name: 'Free Alumini',
    members: '15k',
    time: '10:42 AM',
    views: '18.3k',
    pinned: 'Weekly market outlook posted',
    analysis: {
      title: 'WEEKLY OUTLOOK - NIFTY',
      entry: '—',
      sl: '—',
      target1: '24400',
      target2: '24700',
      disclaimer: DISCLAIMER,
      customerCare: '77380 63455',
      rationale: 'https://bit.ly/4tBVOrE',
      confidence: 'Low probability',
      id: '127',
      tag: 'Free Alumini',
      time: '08:15 AM',
    },
  },
  {
    id: 6,
    name: 'Paid Alumini',
    members: '5.1k',
    time: '10:42 AM',
    views: '4.2k',
    pinned: 'Premium: HDFCBANK 1700 CE',
    analysis: {
      title: 'BUY HDFCBANK 1700 CE',
      entry: '28',
      sl: '22',
      target1: '36',
      target2: '44',
      disclaimer: DISCLAIMER,
      customerCare: '77380 63455',
      rationale: 'https://bit.ly/4tBVOrE',
      confidence: 'High probability',
      id: '128',
      tag: 'Paid Alumini',
      time: '10:20 AM',
    },
  },
];

// Kept for backwards compatibility; defaults to the first community's analysis.
export const CURRENT_ANALYSIS = COMMUNITIES[0].analysis;
