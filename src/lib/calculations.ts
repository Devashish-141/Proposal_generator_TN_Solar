import { PaymentOption, ROIData } from './types'

const INDIA_GRID_EMISSION_FACTOR = 0.82
const CO2_PER_TREE_KG = 22
const CAR_CO2_PER_KM = 0.21
const BENCHMARK_COST_PER_KW = 50000
const ENERGY_COST_INCREASE = 0.042

export function calculateSubsidy(systemSizeKw: number) {
  let centralSubsidy: number
  if (systemSizeKw <= 3) {
    centralSubsidy = 0.3 * systemSizeKw * BENCHMARK_COST_PER_KW
  } else {
    const tier1 = 0.3 * 3 * BENCHMARK_COST_PER_KW
    const tier2 = 0.15 * Math.min(systemSizeKw - 3, 7) * BENCHMARK_COST_PER_KW
    centralSubsidy = Math.min(tier1 + tier2, 78000)
  }
  const tnStateSubsidy = 10000
  const totalSubsidy = Math.round(centralSubsidy) + tnStateSubsidy
  return { centralSubsidy: Math.round(centralSubsidy), tnStateSubsidy, totalSubsidy }
}

export function autoCalculateEcoMetrics(annualProductionKwh: number) {
  const co2SavedKg = Math.round(annualProductionKwh * INDIA_GRID_EMISSION_FACTOR)
  return {
    co2SavedKg,
    treesEquivalent: Math.round(co2SavedKg / CO2_PER_TREE_KG),
    carDistanceAvoidedKm: Math.round(co2SavedKg / CAR_CO2_PER_KM),
  }
}

export function calculateROIForOption(option: PaymentOption, systemSizeKw: number): ROIData {
  const subsidy = calculateSubsidy(systemSizeKw)
  const netCostAfterSubsidy = Math.max(0, option.systemCost - subsidy.totalSubsidy)

  const billSavingPerMonth = option.currentMonthlyBill - option.postSolarMonthlyBill
  const billSavingPerYear = billSavingPerMonth * 12

  const avgMonthlyGen = (option.currentMonthlyBill / 8) * 100 // rough kWh estimate
  const avgMonthlyCons = avgMonthlyGen

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const generationVsConsumption = months.map((month, i) => {
    const factor = 1 + 0.2 * Math.sin((i - 2) * (Math.PI / 6))
    return {
      month,
      generation: Math.round(avgMonthlyGen * factor),
      consumption: Math.round(avgMonthlyCons),
    }
  })

  const cumulativeSavings: { year: number; savings: number }[] = []
  let totalSaved = 0
  let paybackYear: number | null = null

  if (option.type === 'Cash') {
    let annualSaving = billSavingPerYear
    for (let year = 1; year <= 25; year++) {
      totalSaved += annualSaving
      cumulativeSavings.push({ year, savings: Math.round(totalSaved) })
      if (paybackYear === null && totalSaved >= option.systemCost) paybackYear = year
      annualSaving *= (1 + ENERGY_COST_INCREASE)
    }
    const paybackPeriodYears = paybackYear ?? Number((option.systemCost / billSavingPerYear).toFixed(1))
    return {
      monthlySavings: billSavingPerMonth,
      annualSavings: billSavingPerYear,
      paybackPeriodYears,
      lifetimeBenefit25Y: Math.round(totalSaved),
      ...subsidy,
      netCostAfterSubsidy,
      cumulativeSavings,
      generationVsConsumption,
    }
  }

  // Loan
  const emi = option.emi ?? 0
  const loanMonths = option.loanTermMonths ?? 60
  const loanYears = Math.ceil(loanMonths / 12)
  let annualBillSaving = billSavingPerYear
  let netCumulative = 0

  for (let year = 1; year <= 25; year++) {
    const emiCost = year <= loanYears ? emi * 12 : 0
    const netThisYear = annualBillSaving - emiCost
    netCumulative += netThisYear
    cumulativeSavings.push({ year, savings: Math.round(netCumulative) })
    if (paybackYear === null && netCumulative >= 0) paybackYear = year
    annualBillSaving *= (1 + ENERGY_COST_INCREASE)
  }

  const downPayment = option.downPayment ?? 0
  const loanAmt = option.systemCost - downPayment
  const paybackPeriodYears = paybackYear !== null ? paybackYear : '> 25'

  return {
    monthlySavings: billSavingPerMonth - emi,
    annualSavings: billSavingPerYear,
    paybackPeriodYears,
    lifetimeBenefit25Y: Math.round(netCumulative),
    ...subsidy,
    netCostAfterSubsidy: Math.max(0, loanAmt - subsidy.totalSubsidy),
    cumulativeSavings,
    generationVsConsumption,
  }
}
