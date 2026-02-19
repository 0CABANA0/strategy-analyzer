import { useState, useEffect, useCallback } from 'react'
import type { DocumentMeta } from '../types'

const STORAGE_PREFIX = 'strategy-analyzer:'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storageKey = STORAGE_PREFIX + key

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch (e) {
      console.warn('LocalStorage 저장 실패:', e)
    }
  }, [storageKey, value])

  const remove = useCallback(() => {
    localStorage.removeItem(storageKey)
    setValue(initialValue)
  }, [storageKey, initialValue])

  return [value, setValue, remove]
}

/** 문서 목록 관리 */
export function useDocumentList() {
  const [docs, setDocs] = useLocalStorage<DocumentMeta[]>('documents', [])

  const addDocument = useCallback((doc: DocumentMeta) => {
    setDocs((prev) => [doc, ...prev])
  }, [setDocs])

  const removeDocument = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
    localStorage.removeItem(STORAGE_PREFIX + 'doc:' + id)
  }, [setDocs])

  const removeDocuments = useCallback((ids: string[]) => {
    const idSet = new Set(ids)
    setDocs((prev) => prev.filter((d) => !idSet.has(d.id)))
    ids.forEach((id) => localStorage.removeItem(STORAGE_PREFIX + 'doc:' + id))
  }, [setDocs])

  const updateDocumentMeta = useCallback((id: string, meta: Partial<DocumentMeta>) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...meta } : d)))
  }, [setDocs])

  return { docs, addDocument, removeDocument, removeDocuments, updateDocumentMeta }
}
