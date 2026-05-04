export interface PaymentOption {
  id: string
  label: string
  type: 'Cash' | 'Loan'
  systemCost: number
  currentMonthlyBill: number
  postSolarMonthlyBill: number
  // Loan only
  downPayment: number | null
  emi: number | null
  loanTermMonths: number | null
  interestRate: number | null
}

export type ProposalStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED'

export interface FullProposal {
  id: string
  token: string
  status: ProposalStatus
  companyName: string
  companyPhone: string
  companyEmail: string
  companyLogo: string | null
  clientName: string
  clientEmail: string
  clientPhone: string | null
  address: string
  salespersonName: string
  salespersonRole: string
  systemSizeKw: number
  panelCount: number
  panelBrand: string
  panelWattage: number
  inverterModel: string
  batteryModel: string | null
  annualProductionKwh: number
  paymentOptions: PaymentOption[]
  co2SavedKg: number
  treesEquivalent: number
  carDistanceAvoidedKm: number
  notes: string | null
  createdAt: string
  sentAt: string | null
  viewedAt: string | null
  approvedAt: string | null
  createdById: string
}

export interface ProposalFormData {
  companyName: string
  companyPhone: string
  companyEmail: string
  companyLogo: string
  clientName: string
  clientEmail: string
  clientPhone: string
  address: string
  salespersonName: string
  salespersonRole: string
  systemSizeKw: number
  panelCount: number
  panelBrand: string
  panelWattage: number
  inverterModel: string
  batteryModel: string
  annualProductionKwh: number
  paymentOptions: PaymentOption[]
  co2SavedKg: number
  treesEquivalent: number
  carDistanceAvoidedKm: number
  notes: string
}

export interface ROIData {
  monthlySavings: number
  annualSavings: number
  paybackPeriodYears: number | string
  lifetimeBenefit25Y: number
  centralSubsidy: number
  tnStateSubsidy: number
  totalSubsidy: number
  netCostAfterSubsidy: number
  cumulativeSavings: { year: number; savings: number }[]
  generationVsConsumption: { month: string; generation: number; consumption: number }[]
}
