const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Detect if running on Vercel or in production
  if (process.env.VERCEL || process.env.DATABASE_URL?.startsWith('postgres') || process.env.NODE_ENV === 'production') {
    console.log('⚡ [Prisma Prep] Production/PostgreSQL environment detected.');
    if (schema.includes('provider = "sqlite"')) {
      schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, schema);
      console.log('   Changed provider to "postgresql".');
    } else {
      console.log('   Provider is already "postgresql".');
    }
  } else {
    console.log('⚡ [Prisma Prep] Local/SQLite environment detected.');
    if (schema.includes('provider = "postgresql"')) {
      schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, schema);
      console.log('   Changed provider to "sqlite".');
    } else {
      console.log('   Provider is already "sqlite".');
    }
  }
} else {
  console.error('❌ [Prisma Prep] schema.prisma not found at:', schemaPath);
}
