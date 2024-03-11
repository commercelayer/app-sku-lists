import { ErrorNotFound } from '#pages/ErrorNotFound'
import { SkuListDetails } from '#pages/SkuListDetails'
import { SkuListEdit } from '#pages/SkuListEdit'
import { SkuListNew } from '#pages/SkuListNew'
import { SkuListsList } from '#pages/SkuListsList'
import {
  CoreSdkProvider,
  ErrorBoundary,
  MetaTags,
  TokenProvider
} from '@commercelayer/app-elements'
import { SWRConfig } from 'swr'
import { Redirect, Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

const isDev = Boolean(import.meta.env.DEV)
const basePath =
  import.meta.env.PUBLIC_PROJECT_PATH != null
    ? `/${import.meta.env.PUBLIC_PROJECT_PATH}`
    : undefined

export function App(): JSX.Element {
  return (
    <ErrorBoundary hasContainer>
      <SWRConfig
        value={{
          revalidateOnFocus: false
        }}
      >
        <TokenProvider
          kind='sku_lists'
          appSlug='sku_lists'
          domain={window.clAppConfig.domain}
          reauthenticateOnInvalidAuth={!isDev}
          devMode={isDev}
          loadingElement={<div />}
          organizationSlug={import.meta.env.PUBLIC_SELF_HOSTED_SLUG}
        >
          <MetaTags />
          <CoreSdkProvider>
            <Router base={basePath}>
              <Switch>
                <Route path={appRoutes.home.path}>
                  <Redirect to={appRoutes.list.path} />
                </Route>
                <Route path={appRoutes.list.path} component={SkuListsList} />
                <Route
                  path={appRoutes.details.path}
                  component={SkuListDetails}
                />
                <Route path={appRoutes.edit.path} component={SkuListEdit} />
                <Route path={appRoutes.new.path} component={SkuListNew} />
                <Route>
                  <ErrorNotFound />
                </Route>
              </Switch>
            </Router>
          </CoreSdkProvider>
        </TokenProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
