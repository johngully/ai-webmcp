import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom has no scrolling implementation; navigation behavior uses the real router.
window.scrollTo = vi.fn()

afterEach(cleanup)

// jsdom does not implement native dialog methods. Browser tests verify modal
// focus, inert background, Escape, and restoration using actual Chromium.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '')
  this.querySelector<HTMLElement>('button')?.focus()
}
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open')
}
