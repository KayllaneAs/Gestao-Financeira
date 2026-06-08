export function formatCurrency(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 'R$ 0,00'
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  // Se já é ISO completo (com T), parseia direto; se é só data (YYYY-MM-DD), adiciona
  // T00:00:00 para evitar interpretação UTC que causaria um dia a menos no fuso -3
  const d = String(dateStr).includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')
  if (isNaN(d)) return '-'
  return d.toLocaleDateString('pt-BR')
}

export function getCurrentMonth() {
  const now = new Date()
  return { mes: now.getMonth() + 1, ano: now.getFullYear() }
}

export function getMonthName(month) {
  const months = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return months[month] || ''
}

export function getMonthShort(month) {
  const months = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return months[month] || ''
}

export const CATEGORIAS = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
  'Entretenimento', 'Eletrônicos', 'Roupas', 'Contas', 'Outros'
]

export const CATEGORY_COLORS = {
  'Alimentação': '#f59e0b',
  'Transporte': '#3b82f6',
  'Moradia': '#8b5cf6',
  'Saúde': '#ef4444',
  'Educação': '#06b6d4',
  'Entretenimento': '#ec4899',
  'Eletrônicos': '#6366f1',
  'Roupas': '#14b8a6',
  'Contas': '#f97316',
  'Outros': '#64748b',
}

export const CHART_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6']
