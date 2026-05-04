import { z } from 'zod';

export const ProposalSchema = z.object({
  // Project Metadata
  clientName: z.string().min(2, 'Client name is required'),
  address: z.string().min(5, 'Address is required'),
  logoUrl: z.string().optional(),
  salespersonName: z.string().min(2, 'Salesperson name is required'),
  salespersonRole: z.string().default('Solar Consultant'),

  // Technical Inputs
  systemSizeKw: z.number().positive('System size must be positive'),
  panelCount: z.number().int().positive('Panel count must be a positive integer'),
  inverterModel: z.string().min(2, 'Inverter model is required'),
  annualProductionKwh: z.number().positive('Annual production must be positive'),

  // Financial Inputs
  currentMonthlyBill: z.number().nonnegative('Bill cannot be negative'),
  postSolarMonthlyBill: z.number().nonnegative('Bill cannot be negative'),
  systemCost: z.number().positive('System cost must be positive'),
  financeType: z.enum(['Cash', 'Loan']),

  // Environmental Impact
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
  cumulativeSavings: { year: number; savings: number }[];
  generationVsConsumption: { month: string; generation: number; consumption: number }[];
}
