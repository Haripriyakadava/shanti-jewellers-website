const fs = require('fs');
let code = fs.readFileSync('scripts/migrate_supabase_to_prisma.ts', 'utf8');
code = code.replace('url: pi.url,', "url: pi.url || pi.image_url || '',");
fs.writeFileSync('scripts/migrate_supabase_to_prisma.ts', code);
