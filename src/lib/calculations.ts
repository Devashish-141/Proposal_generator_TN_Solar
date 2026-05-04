import { SolarProposal, ROIData, AutoEcoMetrics } from './types';

// India grid emission factor (kg CO2 per kWh) - CEA 2023
const INDIA_GRID_EMISSION_FACTOR = 0.82;
// Average tree absorbs ~22 kg CO2/year
const CO2_PER_TREE_KG = 22;
// Average car emits ~0.21 kg CO2/km
const CAR_CO2_PER_KM = 0.21;

// MNRE benchmark cost per kW (residential, 2024)
const BENCHMARK_COST_PER_KW = 50000;

/**
 * Calculate Central PM Surya Ghar + TN state subsidy.
 * Central: 30% for ≤3kW, 15% for 3–10kW (on benchmark cost), capped at ₹78,000.
 * TN State: flat ₹10,000 additional for residential.
 */
export const calculateSubsidy = (systemSizeKw: number) => {
  const cap3kw = 3;
  let centralSubsidy = 0;

  if (systemSizeKw <= cap3kw) {
    centralSubsidy = 0.3 * systemSizeKw * BENCHMARK_COST_PER_KW;
  } else {
    const tier1 = 0.3 * cap3kw * BENCHMARK_COST_PER_KW;
    const tier2 = 0.15 * Math.min(systemSizeKw - cap3kw, 7) * BENCHMARK_COST_PER_KW;
    centralSubsidy = Math.min(tier1 + tier2, 78000);
  }

  const tnStateSubsidy = 10000;
  const totalSubsidy = centralSubsidy + tnStateSubsidy;

  return {
    centralSubsidy: Math.round(centralSubsidy),
    tnStateSubsidy,
    totalSubsidy: Math.round(totalSubsidy),
  };
};

export const autoCalculateEcoMetrics = (annualProductionKwh: number): AutoEcoMetrics => {
  const co2SavedKg = Math.round(annualProductionKwh * INDIA_GRID_EMISSION_FACTOR);
  const treesEquivalent = Math.round(co2SavedKg / CO2_PER_TREE_KG);
  const carDistanceAvoidedKm = Math.round(co2SavedKg / CAR_CO2_PER_KM);
  return { co2SavedKg, treesEquivalent, carDistanceAvoidedKm };
};

export const calculateSolarROI = (data: SolarProposal): ROIData => {
  const monthlySavings = data.currentMonthlyBill - data.postSolarMonthlyBill;
  const annualSavings = monthlySavings * 12;
  const paybackPeriodYears = data.systemCost / annualSavings;

  const subsidy = calculateSubsidy(data.systemSizeKw);
  const netCostAfterSubsidy = Math.max(0, data.systemCost - subsidy.totalSubsidy);

  const ENERGY_COST_INCREASE = 0.042;
  let totalSaved = 0;
  const cumulativeSavings: { year: number; savings: number }[] = [];
  let currentAnnualSavings = annualSavings;

  for (let year = 1; year <= 25; year++) {
    totalSaved += currentAnnualSavings;
    cumulativeSavings.push({ year, savings: Math.round(totalSaved) });
    currentAnnualSavings *= (1 + ENERGY_COST_INCREASE);
  }

  const lifetimeBenefit25Y = totalSaved;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const avgMonthlyGen = data.annualProductionKwh / 12;
  const avgMonthlyCons = (data.currentMonthlyBill / 8) * 100;

  const generationVsConsumption = months.map((month, index) => {
    const seasonalFactor = 1 + 0.2 * Math.sin((index - 2) * (Math.PI / 6));
    return {
      month,
      generation: Math.round(avgMonthlyGen * seasonalFactor),
      consumption: Math.round(avgMonthlyCons),
    };
  });

  return {
    monthlySavings,
    annualSavings,
    paybackPeriodYears: Number(paybackPeriodYears.toFixed(1)),
    lifetimeBenefit25Y: Math.round(lifetimeBenefit25Y),
    ...subsidy,
    netCostAfterSubsidy,
    cumulativeSavings,
    generationVsConsumption,
  };
};
