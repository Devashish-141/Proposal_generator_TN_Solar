import { SolarProposal, ROIData } from './types';

export const calculateSolarROI = (data: SolarProposal): ROIData => {
  const monthlySavings = data.currentMonthlyBill - data.postSolarMonthlyBill;
  const annualSavings = monthlySavings * 12;
  const paybackPeriodYears = data.systemCost / annualSavings;

  const ENERGY_COST_INCREASE = 0.042; // 4.2% annual increase
  let lifetimeBenefit25Y = 0;
  const cumulativeSavings: { year: number; savings: number }[] = [];
  
  let currentAnnualSavings = annualSavings;
  let totalSaved = 0;

  for (let year = 1; year <= 25; year++) {
    totalSaved += currentAnnualSavings;
    cumulativeSavings.push({ year, savings: Math.round(totalSaved) });
    currentAnnualSavings *= (1 + ENERGY_COST_INCREASE);
  }

  lifetimeBenefit25Y = totalSaved;

  // Mock Generation vs Consumption data based on annual production
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const avgMonthlyGen = data.annualProductionKwh / 12;
  const avgMonthlyCons = (data.currentMonthlyBill / 8) * 100; // Estimation: ₹8/kWh

  const generationVsConsumption = months.map((month, index) => {
    // Add some seasonality
    const seasonalFactor = 1 + 0.2 * Math.sin((index - 2) * (Math.PI / 6));
    return {
      month,
      generation: Math.round(avgMonthlyGen * seasonalFactor),
      consumption: Math.round(avgMonthlyCons * (1 + 0.1 * Math.random())),
    };
  });

  return {
    monthlySavings,
    annualSavings,
    paybackPeriodYears: Number(paybackPeriodYears.toFixed(1)),
    lifetimeBenefit25Y: Math.round(lifetimeBenefit25Y),
    cumulativeSavings,
    generationVsConsumption,
  };
};
