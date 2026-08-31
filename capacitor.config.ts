import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.piggybank.app',
  appName: 'Piggy Bank',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
}

export default config
