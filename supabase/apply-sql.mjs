import { readFileSync } from 'node:fs';

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.VITE_SUPABASE_PROJECT_REF || 'bsferotadfpmyuhxkvgj';
const files = process.argv.slice(2);
if (!token) throw new Error('SUPABASE_ACCESS_TOKEN missing');

for (const file of files) {
  const query = readFileSync(file, 'utf8');
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${file}: ${response.status} ${text}`);
  console.log(`applied ${file}`);
}
