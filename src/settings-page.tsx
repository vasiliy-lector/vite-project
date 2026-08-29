import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchRemoteSettings } from './settings-api';
import { box, button, error, fieldStyle, heading, heading2, input, saved } from './settings.css';

const usernameSchema = z.string().min(2, 'Имя: минимум 2 символа');
const ageSchema = z
  .number()
  .int('Возраст: введите целое число')
  .min(1, 'Возраст: минимум 1')
  .max(120, 'Возраст: максимум 120');

function errorText(error: unknown): string {
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return String(error);
}

export function SettingsPage() {
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      age: 18,
    },
    onSubmit: () => {
      setIsSaved(true);
    },
  });

  const { data, isPending } = useQuery({
    queryKey: ['remote-settings'],
    queryFn: fetchRemoteSettings,
  });

  return (
    <section className={box}>
      <h1 className={heading}>Настройки</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(event);
        }}
      >
        <form.Field name="username" validators={{ onChange: usernameSchema }}>
          {(field) => (
            <label className={fieldStyle}>
              Имя
              <input
                className={input}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <em className={error}>{field.state.meta.errors.map(errorText).join(', ')}</em>
              ) : null}
            </label>
          )}
        </form.Field>
        <form.Field name="age" validators={{ onChange: ageSchema }}>
          {(field) => (
            <label className={fieldStyle}>
              Возраст
              <input
                className={input}
                type="number"
                value={field.state.value}
                onChange={(event) => field.handleChange(Number(event.target.value))}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <em className={error}>{field.state.meta.errors.map(errorText).join(', ')}</em>
              ) : null}
            </label>
          )}
        </form.Field>
        <div>
          <button type="submit" className={button}>
            Сохранить
          </button>
        </div>
        {isSaved ? (
          <p data-testid="settings-saved" className={saved}>
            Сохранено
          </p>
        ) : null}
      </form>
      <h2 className={heading2}>Данные (TanStack Query)</h2>
      <p data-testid="query-data">
        {isPending ? 'Загрузка…' : data ? `Заявки: ${data.requests}` : 'Не удалось загрузить'}
      </p>
    </section>
  );
}