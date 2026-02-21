import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
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

/** 문서 목록 관리 (Supabase 기반) */
export function useDocumentList() {
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Supabase에서 문서 목록 로드
  const fetchDocs = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setDocs([])
      setIsLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('strategy_documents')
      .select('id, business_item, created_at, updated_at')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
    if (error) {
      console.warn('문서 목록 조회 실패:', error.message)
      setIsLoading(false)
      return
    }
    setDocs((data ?? []).map((d) => ({
      id: d.id,
      businessItem: d.business_item,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    })))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const removeDocument = useCallback(async (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
    localStorage.removeItem(STORAGE_PREFIX + 'doc:' + id)
    await supabase.from('strategy_documents').delete().eq('id', id)
  }, [])

  const removeDocuments = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids)
    setDocs((prev) => prev.filter((d) => !idSet.has(d.id)))
    ids.forEach((id) => localStorage.removeItem(STORAGE_PREFIX + 'doc:' + id))
    await supabase.from('strategy_documents').delete().in('id', ids)
  }, [])

  return { docs, isLoading, removeDocument, removeDocuments, refreshDocs: fetchDocs }
}
