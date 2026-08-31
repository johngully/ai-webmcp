import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import {
  AvailabilityProvider,
  AvailableAssistant,
  type AvailabilityOperations,
} from '../availability/availability'
import appCss from '../styles.css?url'
import type { SurveyManagementOperations } from '../survey/survey.types'

export const Route = createRootRouteWithContext<{
  availability: AvailabilityOperations
  management: SurveyManagementOperations
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AI Dev Days · Conference survey',
      },
      {
        name: 'description',
        content:
          'Share your AI Dev Days talk feedback and choose a thank-you gift.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AvailabilityProvider operations={Route.useRouteContext().availability}>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <header className="site-header">
            <div className="container header-content">
              <span className="brand">
                AI Dev Days <span> / Conference survey</span>
              </span>
              <nav aria-label="Main">
                <Link to="/" activeOptions={{ exact: true }}>
                  Home
                </Link>
                <Link
                  to="/survey/new"
                  search={{ step: 1 }}
                  activeOptions={{ includeSearch: false }}
                >
                  Take survey
                </Link>
                <Link to="/survey" activeOptions={{ exact: true }}>
                  Manage responses
                </Link>
              </nav>
            </div>
          </header>
          <main className="container" id="main-content" tabIndex={-1}>
            {children}
          </main>
          <footer className="container site-footer">
            <AvailableAssistant />
            AI Dev Days · Conference feedback
          </footer>
        </AvailabilityProvider>
        <Scripts />
      </body>
    </html>
  )
}
