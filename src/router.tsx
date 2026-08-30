import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { findSurveys, deleteSurveys } from './survey/survey.functions'
import type { SurveyManagementOperations } from './survey/survey.types'

export function getRouter(options?: {
  management: SurveyManagementOperations
}) {
  const router = createTanStackRouter({
    routeTree,
    context: {
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
