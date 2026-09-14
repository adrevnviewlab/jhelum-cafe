import { writeStore, readStore } from './localStore.js';
import { supabase, supabaseConfigured } from './supabase.js';

const DEMO_USERS = {
  'admin@jehlum.local': { role: 'admin', name: 'Cafe admin', id: 'demo-admin' },
  'admin@jehlum.cafe': { role: 'admin', name: 'Cafe admin', id: 'demo-admin' },
  'staff@jehlum.local': { role: 'staff', name: 'Kitchen staff', id: 'demo-staff' },
  'kitchen@jehlum.cafe': { role: 'staff', name: 'Kitchen staff', id: 'demo-staff' },
  'driver@jehlum.local': { role: 'driver', name: 'Jhelum driver', id: 'demo-driver' },
  'driver@jehlum.cafe': { role: 'driver', name: 'Jhelum driver', id: 'demo-driver' },
};

export async function currentProfile() {
  if (supabaseConfigured) {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return data || { id: user.id, role: 'customer', name: user.email, email: user.email };
  }
  return readStore().demoUser;
}

export async function signIn(email, password) {
  if (supabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return currentProfile();
  }
  const profile = DEMO_USERS[email.trim().toLowerCase()];
  if (!profile || !password) throw new Error('Use admin@jehlum.local, staff@jehlum.local, or driver@jehlum.local.');
  const user = { ...profile, email: email.trim().toLowerCase() };
  writeStore(store => ({ ...store, demoUser: user }));
  return user;
}

export async function signOut() {
  if (supabaseConfigured) await supabase.auth.signOut();
  writeStore(store => ({ ...store, demoUser: null }));
}

export function canManageKitchen(profile) {
  return profile?.role === 'admin' || profile?.role === 'staff';
}

export function canManageSettings(profile) {
  return profile?.role === 'admin';
}

export function isDriver(profile) {
  return profile?.role === 'driver';
}
