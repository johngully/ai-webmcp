import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import {
  getAvailability,
  setAvailability,
} from './availability/availability.functions'
import type { AvailabilityOperations } from './availability/availability'
import { routeTree } from './routeTree.gen'
import { findSurveys, deleteSurveys } from './survey/survey.functions'
import type { SurveyManagementOperations } from './survey/survey.types'

export function getRouter(options?: {
  management: SurveyManagementOperations
  availability?: AvailabilityOperations
}) {
  const router = createTanStackRouter({
    routeTree,
    context: {
      availability: options?.availability ?? {
        getAvailability: () => getAvailability(),
        setAvailability: (data) => setAvailability({ data }),
      },
      management: options?.management ?? {
        findSurveys: (filters) => findSurveys({ data: filters }),
        deleteSurveys: (input) => deleteSurveys({ data: input }),
      },
    },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
