import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom has no scrolling implementation; navigation behavior uses the real router.
window.scrollTo = vi.fn()

afterEach(cleanup)
