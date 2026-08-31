import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // This project intentionally hydrates browser-only state in effects.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores(['android/**', 'ios/**', 'out/**', '.next/**', 'prisma/generated/**']),
])
