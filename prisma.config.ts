import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Migrations must use Supabase's direct (port 5432) connection. The app
    // uses the pooled DATABASE_URL at runtime.
    url: env('DIRECT_URL'),
  },
})
