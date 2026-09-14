import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

export function quoteTotals(subtotalCents: number, taxBps: number, tipCents: number, deliveryFeeCents: number) {
  const taxCents = Math.round(subtotalCents * taxBps / 100_000);
  return {
    subtotal_cents: subtotalCents,
    tax_bps: taxBps,
    tax_cents: taxCents,
    tip_cents: tipCents,
    delivery_fee_cents: deliveryFeeCents,
    total_cents: subtotalCents + taxCents + tipCents + deliveryFeeCents,
  };
}

export function haversineMiles(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 3958.8 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function applyRules(miles: number, rules: Array<{ min_miles: number; max_miles: number; fee_cents: number; label?: string }>) {
  const match = [...rules].sort((a, b) => a.min_miles - b.min_miles)
    .find(rule => miles >= Number(rule.min_miles) && miles <= Number(rule.max_miles));
  if (!match) return { eligible: false, miles: Number(miles.toFixed(2)), fee_cents: null, reason: 'outside_zone' };
  return { eligible: true, miles: Number(miles.toFixed(2)), fee_cents: match.fee_cents, reason: match.fee_cents === 0 ? 'free' : 'paid', rule: match };
}

export async function sendSms(to: string, body: string) {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_FROM');
  if (!sid || !token || !from || !to) return { skipped: true };
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${sid}:${token}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  return { ok: response.ok };
}
