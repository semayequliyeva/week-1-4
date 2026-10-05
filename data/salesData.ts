// Satis melumatlarinin tip strukturu
export interface SaleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  region: string;
  amount: number;
}

// Qrafik ucun test melumatlari (mock data)
export const MOCK_SALES: SaleRecord[] = [
  { id: '1', date: '2026-01-15', category: 'Electronics', region: 'Baku', amount: 1200 },
  { id: '2', date: '2026-01-20', category: 'Clothing', region: 'Ganja', amount: 450 },
  { id: '3', date: '2026-02-10', category: 'Home Appliances', region: 'Baku', amount: 800 },
  { id: '4', date: '2026-02-14', category: 'Electronics', region: 'Sumqayit', amount: 1500 },
  { id: '5', date: '2026-03-01', category: 'Clothing', region: 'Baku', amount: 650 },
  { id: '6', date: '2026-03-05', category: 'Home Appliances', region: 'Ganja', amount: 300 },
  { id: '7', date: '2026-03-12', category: 'Electronics', region: 'Baku', amount: 2100 },
  { id: '8', date: '2026-04-02', category: 'Clothing', region: 'Sumqayit', amount: 900 },
  { id: '9', date: '2026-04-18', category: 'Home Appliances', region: 'Baku', amount: 1100 },
  { id: '10', date: '2026-05-01', category: 'Electronics', region: 'Ganja', amount: 1750 },
  { id: '11', date: '2026-05-15', category: 'Clothing', region: 'Baku', amount: 1300 },
  { id: '12', date: '2026-06-01', category: 'Home Appliances', region: 'Sumqayit', amount: 950 },
];