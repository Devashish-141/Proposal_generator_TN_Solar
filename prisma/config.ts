// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './schema.prisma',
} as Parameters<typeof defineConfig>[0])
