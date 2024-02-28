import { ListItemSkuList } from '#components/ListItemSkuList'
import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function SkuListsList(): JSX.Element {
  const {
    canUser,
    settings: { mode, dashboardUrl }
  } = useTokenProvider()

  const queryString = useSearch()

  const { SearchWithNav, FilteredList, hasActiveFilter } = useResourceFilters({
    instructions
  })

  if (!canUser('read', 'sku_lists')) {
    return (
      <PageLayout title='SKU Lists' mode={mode}>
        <EmptyState title='You are not authorized' />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title='SKU Lists'
      mode={mode}
      gap='only-top'
      navigationButton={{
        onClick: () => {
          window.location.href =
            dashboardUrl != null ? `${dashboardUrl}/hub` : '/'
        },
        label: 'Hub',
        icon: 'arrowLeft'
      }}
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={() => {}}
        hideFiltersNav
      />
      <FilteredList
        type='sku_lists'
        query={{
          sort: {
            created_at: 'desc'
          }
        }}
        ItemTemplate={ListItemSkuList}
        emptyState={
          hasActiveFilter ? (
            <EmptyState
              title='No SKU lists found!'
              description={
                <div>
                  <p>We didn't find any SKU lists matching the search.</p>
                </div>
              }
              action={
                canUser('create', 'sku_lists') && (
                  <Link href={appRoutes.new.makePath({})}>
                    <Button variant='primary'>Add a SKU list</Button>
                  </Link>
                )
              }
            />
          ) : (
            <EmptyState
              title='No SKU lists yet!'
              action={
                canUser('create', 'sku_lists') && (
                  <Link href={appRoutes.new.makePath({})}>
                    <Button variant='primary'>Add a SKU list</Button>
                  </Link>
                )
              }
            />
          )
        }
        actionButton={
          canUser('create', 'sku_lists') ? (
            <Link href={appRoutes.new.makePath({})}>Add new</Link>
          ) : undefined
        }
      />
    </PageLayout>
  )
}
