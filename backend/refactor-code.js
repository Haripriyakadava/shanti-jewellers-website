const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(dirPath);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Be careful with replacements, order matters
  
  // 1. Prisma model types
  content = content.replace(/\bUserRole\b/g, 'CustomerRole');
  content = content.replace(/\bUser\b/g, 'Customer');
  content = content.replace(/\buser\b/g, 'customer');
  
  // 2. userId -> customerId
  content = content.replace(/\buserId\b/g, 'customerId');
  content = content.replace(/\bUserId\b/g, 'CustomerId');
  
  // 3. req.user -> req.customer
  content = content.replace(/req\.user/g, 'req.customer');
  
  // 4. users -> customers (if any)
  content = content.replace(/\busers\b/g, 'customers');
  content = content.replace(/\bUsers\b/g, 'Customers');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored: ${file}`);
  }
});
