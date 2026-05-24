import { useEffect, useRef } from 'react'

interface DialogA11yOptions {
  isOpen: boolean
  onClose: () => void
}

export function useDialogA11y<T extends HTMLElement>({ isOpen, onClose }: DialogA11yOptions) {
  const containerRef = useRef<T | null>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    previousActiveElement.current = document.activeElement as HTMLElement

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }

      if (event.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            event.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            event.preventDefault()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    if (containerRef.current) {
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'input, select, textarea, button, a'
      )
      if (focusable.length > 0) {
        const firstInput = Array.from(focusable).find(
          (el) => el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'
        )
        if (firstInput) {
          firstInput.focus()
        } else {
          focusable[0].focus()
        }
      }
    }

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)

      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose])

  return containerRef
}
