const url = process.env.VITE_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) throw new Error('Missing Supabase env');

const users = [
  { email: 'admin@jehlum.cafe', password: 'JhelumDirect2026!', role: 'admin', name: 'Cafe admin' },
  { email: 'kitchen@jehlum.cafe', password: 'JhelumDirect2026!', role: 'staff', name: 'Kitchen staff' },
  { email: 'driver@jehlum.cafe', password: 'JhelumDirect2026!', role: 'driver', name: 'Jhelum driver' },
];

for (const user of users) {
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: user.password, email_confirm: true }),
  });
  const payload = await response.json();
  if (!response.ok && !String(payload.msg || payload.message || '').includes('already')) {
    console.error(user.email, payload);
    continue;
  }
  const id = payload.id;
  if (!id) {
    console.log(user.email, 'exists or skipped');
    continue;
  }
  await fetch(`${url}/rest/v1/profiles`, {
    method: 'POST',
    headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ id, role: user.role, name: user.name }),
  });
  console.log('created', user.email, user.role);
}
