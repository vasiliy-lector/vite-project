import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { useState } from 'react';
import {
  checkboxRow,
  errorStatus,
  errorText,
  fieldLabel,
  formStyle,
  input,
  saveButton,
  section,
  sectionTitle,
  statusText,
  themeRow,
} from './settings.css';
import { fetchSettings, type Settings } from './mock-api';
import { useThemeStore } from './theme-store';

const settingsSchema = z.object({
  displayName: z.string().min(2, 'Минимум 2 символа').max(32, 'Максимум 32 символа'),
  compactMode: z.boolean(),
});

// Страница /settings: демо глобального стора (тема), TanStack Query
// (загрузка данных из локального mock) и TanStack Form с валидацией через zod
export function SettingsPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  if (isPending) {
    return (
      <section className={section}>
        <h2 className={sectionTitle}>Настройки</h2>
        <p className={statusText} data-testid="settings-loading">
          Загрузка настроек…
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={section}>
        <h2 className={sectionTitle}>Настройки</h2>
        <p className={errorStatus} data-testid="settings-error">
          Не удалось загрузить настройки
        </p>
      </section>
    );
  }

  return <SettingsContent initial={data} />;
}

function SettingsContent({ initial }: { initial: Settings }) {
  const themeMode = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [savedName, setSavedName] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      displayName: initial.displayName,
      compactMode: initial.compactMode,
    },
    validators: { onSubmit: settingsSchema },
    onSubmit: async ({ value }) => {
      // Имитация запроса к серверу
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSavedName(value.displayName);
    },
  });

  return (
    <section className={section}>
      <h2 className={sectionTitle}>Настройки</h2>

      <div className={themeRow}>
        <span>Тема: {themeMode === 'dark' ? 'тёмная' : 'светлая'}</span>
        <button type="button" className={saveButton} onClick={toggleTheme}>
          Переключить тему
        </button>
      </div>

      <form
        className={formStyle}
        noValidate
        onSubmit={(event) => {
          // form.handleSubmit не вызывает preventDefault сам —
          // без него браузер перезагрузит страницу (см. доки TanStack Form)
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="displayName">
          {(field) => {
            // Ошибки zod приходят объектами Standard Schema (со свойством message)
            const errorMessages = field.state.meta.errors.flatMap((error) =>
              error === undefined ? [] : [typeof error === 'string' ? error : error.message],
            );

            return (
              <label className={fieldLabel}>
                Отображаемое имя
                <input
                  className={input}
                  name={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  data-testid="display-name"
                />
                {errorMessages.length > 0 ? (
                  <span className={errorText} role="alert">
                    {errorMessages.join(', ')}
                  </span>
                ) : null}
              </label>
            );
          }}
        </form.Field>

        <form.Field name="compactMode">
          {(field) => (
            <label className={checkboxRow}>
              <input
                type="checkbox"
                name={field.name}
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
                onBlur={field.handleBlur}
              />
              Компактный режим
            </label>
          )}
        </form.Field>

        <button type="submit" className={saveButton} disabled={form.state.isSubmitting}>
          Сохранить
        </button>

        {savedName !== null ? (
          <p className={statusText} data-testid="settings-saved">
            Сохранено: {savedName}
          </p>
        ) : null}
      </form>
    </section>
  );
}
