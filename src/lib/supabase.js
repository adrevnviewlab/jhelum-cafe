import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);
export const supabase = supabaseConfigured ? createClient(url, key) : null;

export function functionsUrl(name) {
  if (!url) return '';
  return `${url.replace(/\/$/, '')}/functions/v1/${name}`;
}

export async function invokeFunction(name, body, { token } = {}) {
  const target = functionsUrl(name);
  if (!target || !key) {
    const error = new Error('Supabase functions are not configured');
    error.code = 'no_functions';
    throw error;
  }
  const response = await fetch(target, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${token || key}`,
    },
    body: JSON.stringify(body || {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Function ${name} failed`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}
