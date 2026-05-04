import { z } from 'zod';

export const ProposalSchema = z.object({
  // Company Branding
  companyName: z.string().min(2, 'Company name is required'),
  companyPhone: z.string().min(10, 'Phone is required'),
  companyEmail: z.string().email('Valid email required'),

  // Project Metadata
  clientName: z.string().min(2, 'Client name is required'),
  address: z.string().min(5, 'Address is required'),
  salespersonName: z.string().min(2, 'Salesperson name is required'),
  salespersonRole: z.string().min(1, 'Role is required'),

  // Technical Inputs
  systemSizeKw: z.number().positive('System size must be positive'),
  panelCount: z.number().int().positive('Panel count must be a positive integer'),
  panelBrand: z.string().min(2, 'Panel brand is required'),
  panelWattage: z.number().int().positive('Panel wattage must be positive'),
  inverterModel: z.string().min(2, 'Inverter model is required'),
  batteryModel: z.string().optional(),
  annualProductionKwh: z.number().positive('Annual production must be positive'),

  // Financial Inputs
  currentMonthlyBill: z.number().nonnegative('Bill cannot be negative'),
  postSolarMonthlyBill: z.number().nonnegative('Bill cannot be negative'),
  systemCost: z.number().positive('System cost must be positive'),
  financeType: z.enum(['Cash', 'Loan']),

  // Environmental Impact (auto-calculated or manual)
  co2SavedKg: z.number().nonnegative(),
  treesEquivalent: z.number().int().nonnegative(),
  carDistanceAvoidedKm: z.number().nonnegative(),
});

export type SolarProposal = z.infer<typeof ProposalSchema>;

export interface ROIData {
  monthlySavings: number;
  annualSavings: number;
  paybackPeriodYears: number;
  lifetimeBenefit25Y: number;
  centralSubsidy: number;
  tnStateSubsidy: number;
  totalSubsidy: number;
  netCostAfterSubsidy: number;
  cumulativeSavings: { year: number; savings: number }[];
  generationVsConsumption: { month: string; generation: number; consumption: number }[];
}

export interface AutoEcoMetrics {
  co2SavedKg: number;
  treesEquivalent: number;
  carDistanceAvoidedKm: number;
}
