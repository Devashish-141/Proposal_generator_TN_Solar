export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function statusColor(status: string): string {
  switch (status) {
    case 'DRAFT':    return 'bg-slate-100 text-slate-600'
    case 'SENT':     return 'bg-blue-100 text-blue-700'
    case 'VIEWED':   return 'bg-yellow-100 text-yellow-700'
    case 'APPROVED': return 'bg-emerald-100 text-emerald-700'
    default:         return 'bg-slate-100 text-slate-600'
  }
}

export function statusDot(status: string): string {
  switch (status) {
    case 'DRAFT':    return 'bg-slate-400'
    case 'SENT':     return 'bg-blue-500'
    case 'VIEWED':   return 'bg-yellow-500'
    case 'APPROVED': return 'bg-emerald-500'
    default:         return 'bg-slate-400'
  }
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function avatarColor(name: string): string {
  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

/** Simple EMI calculator */
export function calculateEMI(principal: number, annualRatePct: number, months: number): number {
  if (annualRatePct === 0) return Math.round(principal / months)
  const r = annualRatePct / 100 / 12
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  return Math.round(emi)
}
