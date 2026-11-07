/**
 * Formats values into Brazilian Real (BRL) currency string
 */
export const brl = (v: number | null | undefined): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
};

/**
 * Formats unit costs with up to 4 decimal places for precise micro-costs
 */
export const brl4 = (v: number | null | undefined): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(v);
};

/**
 * Formats a generic number with pt-BR locale
 */
export const num = (v: number | null | undefined, places = 2): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: places,
  }).format(v);
};

/**
 * Formats a percentage value
 */
export const pct = (v: number | null | undefined): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return `${num(v, 1)}%`;
};

/**
 * Converts a number to input text representation (e.g. 3.6 -> "3,6")
 */
export const formatInputValue = (v: number | null | undefined): string => {
  if (v === null || v === undefined) return '';
  return String(v).replace('.', ',');
};

/**
 * Parses user input string (handling both commas and dots) into number or null
 */
export const parseInputValue = (raw: string): number | null => {
  if (raw === '' || raw.trim() === '') return null;
  const sanitized = raw.trim().replace(',', '.');
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : null;
};
