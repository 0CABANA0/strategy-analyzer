import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import React from 'react'

interface MobileSidebarState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const MobileSidebarContext = createContext<MobileSidebarState>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
})

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // 라우트 변경 시 자동 닫힘
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return React.createElement(
    MobileSidebarContext.Provider,
    { value: { isOpen, open, close, toggle } },
    children
  )
}

export function useMobileSidebar() {
  return useContext(MobileSidebarContext)
}
