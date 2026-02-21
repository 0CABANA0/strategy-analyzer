import React, { Suspense } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth'
import { StrategyProvider } from '../hooks/useStrategyDocument'
import { SettingsProvider } from '../hooks/useSettings'
import { ToastProvider } from '../hooks/useToast'
import { MobileSidebarProvider } from '../hooks/useMobileSidebar'

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SettingsProvider>
            <StrategyProvider>
              <MobileSidebarProvider>
                <Suspense fallback={null}>
                  {children}
                </Suspense>
              </MobileSidebarProvider>
            </StrategyProvider>
          </SettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export { render }
export { default as userEvent } from '@testing-library/user-event'
