/**
 * 커스텀 프레임워크 CRUD (localStorage)
 */
import type { FieldDef } from '../types/framework'

export interface CustomFramework {
  id: string
  name: string
  fullName: string
  section: number
  description: string
  fields: Record<string, FieldDef>
  prompt: string  // AI 프롬프트 템플릿
  createdAt: string
}

const STORAGE_KEY = 'strategy-analyzer:custom-frameworks'

function loadAll(): CustomFramework[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(items: CustomFramework[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function getCustomFrameworks(): CustomFramework[] {
  return loadAll()
}

export function addCustomFramework(fw: CustomFramework): void {
  const items = loadAll()
  items.push(fw)
  saveAll(items)
}

export function updateCustomFramework(id: string, updates: Partial<CustomFramework>): void {
  const items = loadAll()
  const idx = items.findIndex((f) => f.id === id)
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...updates }
    saveAll(items)
  }
}

export function deleteCustomFramework(id: string): void {
  const items = loadAll().filter((f) => f.id !== id)
  saveAll(items)
}

/** 커스텀 프레임워크 ID 생성 (충돌 방지) */
export function generateCustomId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}
