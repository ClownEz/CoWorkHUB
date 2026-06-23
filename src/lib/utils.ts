export function cn(...inputs: (string | boolean | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return `${formatDate(date)}, ${formatTime(date)}`
}
