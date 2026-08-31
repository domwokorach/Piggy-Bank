import type { ReactNode } from 'react'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { CookieSettingsLink } from '@/components/consent/CookieSettingsLink'
import { Header } from '@/components/navigation/Header'
import { Sidebar } from '@/components/navigation/Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-8">
          {children}
          <footer className="mt-10 flex justify-center border-t border-border pt-4 md:justify-start">
            <CookieSettingsLink />
          </footer>
        </main>
      </div>
      <BottomNavigation />
    </div>
  )
}
