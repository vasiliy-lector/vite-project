import * as z from 'zod';

// Общие контракты настроек пользователя: одна и та же схема валидирует
// запросы на бэкенде, заполняет форму на клиенте (TanStack Form принимает
// Standard Schema) и описывает DTO, летающее по API.

export const settingsSchema = z.object({
  displayName: z.string().min(2, 'Минимум 2 символа').max(32, 'Максимум 32 символа'),
  compactMode: z.boolean(),
});

export type SettingsDto = z.infer<typeof settingsSchema>;

// Значения по умолчанию (и для сида БД, и как fallback на клиенте)
export const defaultSettings: SettingsDto = {
  displayName: 'Гость',
  compactMode: false,
};
