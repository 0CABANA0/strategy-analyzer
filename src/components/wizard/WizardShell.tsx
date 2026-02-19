import React from 'react'
import Sidebar from '../layout/Sidebar'
import MobileSidebar from '../layout/MobileSidebar'
import StepIndicator from './StepIndicator'
import StepNavigation from './StepNavigation'
import { SECTIONS } from '../../data/sectionDefinitions'
import { useWizard } from '../../hooks/useWizard'
import { useMobileSidebar } from '../../hooks/useMobileSidebar'

interface WizardShellProps {
  children: React.ReactNode
}

export default function WizardShell({ children }: WizardShellProps) {
  const { currentStep } = useWizard()
  const section = SECTIONS.find((s) => s.number === currentStep)
  const { isOpen, close } = useMobileSidebar()

  return (
    <div className="flex gap-6 max-w-screen-2xl mx-auto px-4 py-4">
      <Sidebar />
      <MobileSidebar isOpen={isOpen} onClose={close} />
      <main className="flex-1 min-w-0">
        <StepIndicator />
        {section && (
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              <span className="text-primary-600">{section.number}.</span> {section.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{section.description}</p>
          </div>
        )}
        <div className="animate-fade-in">
          {children}
        </div>
        <StepNavigation />
      </main>
    </div>
  )
}
