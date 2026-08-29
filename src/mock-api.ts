export type Settings = {
  displayName: string;
  compactMode: boolean;
};

// Локальный mock «API»: детерминированные данные без обращения в сеть,
// чтобы демо (и e2e-тесты) работали офлайн.
export async function fetchSettings(): Promise<Settings> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { displayName: 'Гость', compactMode: false };
}
