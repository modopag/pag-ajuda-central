// FAQ Categories shared across the application
export const FAQ_CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'taxas', label: 'Taxas' },
  { value: 'maquininha', label: 'Maquininha' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'conta-digital', label: 'Conta Digital' },
  { value: 'suporte', label: 'Suporte' }
] as const;

export type FAQCategoryValue = typeof FAQ_CATEGORIES[number]['value'];