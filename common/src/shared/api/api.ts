// Общие пути API-контракта (клиент строит URL от VITE_API_URL,
// бэкенд регистрирует роуты по этим же путям).

export const apiPaths = {
  settings: '/api/settings',
  counter: '/api/counter',
} as const;
