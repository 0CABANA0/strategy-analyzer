import { useState, useCallback } from 'react'

const STORAGE_KEY = 'strategy-analyzer:framework-order'

type OrderMap = Record<string, string[]>

/** localStorage에서 커스텀 순서 로드 */
function loadOrder(): OrderMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/** localStorage에 커스텀 순서 저장 */
function saveOrder(orderMap: OrderMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orderMap))
}

/**
 * 섹션 내 프레임워크 순서 관리 훅
 * - 기본 순서를 커스텀 순서로 오버라이드
 * - HTML5 Drag & Drop API 사용 (외부 라이브러리 없이)
 */
export function useFrameworkOrder(sectionId: string, defaultOrder: string[]) {
  const [orderMap, setOrderMap] = useState<OrderMap>(loadOrder)

  const currentOrder = orderMap[sectionId] || defaultOrder

  /** 드래그 결과 반영: fromIndex → toIndex 이동 */
  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const order = [...(orderMap[sectionId] || defaultOrder)]
    const [moved] = order.splice(fromIndex, 1)
    order.splice(toIndex, 0, moved)

    const newMap = { ...orderMap, [sectionId]: order }
    setOrderMap(newMap)
    saveOrder(newMap)
  }, [orderMap, sectionId, defaultOrder])

  /** 기본 순서로 리셋 */
  const resetOrder = useCallback(() => {
    const newMap = { ...orderMap }
    delete newMap[sectionId]
    setOrderMap(newMap)
    saveOrder(newMap)
  }, [orderMap, sectionId])

  const isCustomOrder = !!orderMap[sectionId]

  return { order: currentOrder, reorder, resetOrder, isCustomOrder }
}
