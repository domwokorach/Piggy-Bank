import { create } from 'zustand'
import type { AppNotification } from '@/types'

// Deliberately not persisted (unlike bank-store) — live toasts are
// session-transient UI state, not part of Notification History.
const MAX_VISIBLE = 3

interface ToastState {
  visible: AppNotification[]
  queue: AppNotification[]
  enqueue: (toast: AppNotification) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>()((set, get) => ({
  visible: [],
  queue: [],

  enqueue: (toast) =>
    set((state) =>
      state.visible.length < MAX_VISIBLE
        ? { visible: [...state.visible, toast] }
        : { queue: [...state.queue, toast] },
    ),

  dismiss: (id) => {
    const { queue } = get()
    set((state) => {
      const remaining = state.visible.filter((t) => t.id !== id)
      if (remaining.length < state.visible.length && queue.length > 0) {
        const [next, ...rest] = queue
        return { visible: [...remaining, next], queue: rest }
      }
      return { visible: remaining }
    })
  },
}))
