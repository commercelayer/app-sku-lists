import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemSku } from '#components/ListItemSku'
import {
  Card,
  PageLayout,
  useOverlay,
  useResourceFilters
} from '@commercelayer/app-elements'
import type { FiltersInstructions } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'
import type { Sku } from '@commercelayer/sdk'
import { useState } from 'react'
import { navigate, useSearch } from 'wouter/use-location'

interface OverlayHook {
  show: (excludedIds?: string) => void
  Overlay: React.FC<{ onConfirm: (resource: Sku) => void }>
}

export function useAddItemOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const [excludedIds, setExcludedIds] = useState<string>('')

  const instructions: FiltersInstructions = [
    {
      label: 'Search',
      type: 'textSearch',
      sdk: {
        predicate: ['name', 'code'].join('_or_') + '_cont'
      },
      render: {
        component: 'searchBar'
      }
    }
  ]

  return {
    show: (excludedIds) => {
      console.log(excludedIds)
      if (excludedIds != null) {
        setExcludedIds(excludedIds)
      }
      open()
    },
    Overlay: ({ onConfirm }) => {
      const queryString = useSearch()
      const { SearchWithNav, FilteredList, hasActiveFilter } =
        useResourceFilters({
          instructions
        })

      return (
        <OverlayElement backgroundColor='light'>
          <PageLayout
            title='Pick a SKU'
            gap='only-top'
            navigationButton={{
              onClick: () => {
                close()
              },
              label: 'Back',
              icon: 'arrowLeft'
            }}
          >
            <div className='w-full flex items-center gap-4'>
              <div className='flex-1'>
                <SearchWithNav
                  onFilterClick={() => {}}
                  onUpdate={(qs) => {
                    navigate(`?${qs}`, {
                      replace: true
                    })
                  }}
                  queryString={queryString}
                  hideFiltersNav
                  searchBarPlaceholder='search...'
                />
              </div>
              <div className='mt-4 mb-14'>
                <button
                  onClick={() => {
                    close()
                  }}
                  className='text-primary font-bold rounded px-1 shadow-none !outline-0 !border-0 !ring-0 focus:shadow-focus'
                >
                  Cancel
                </button>
              </div>
            </div>
            <Card gap='none'>
              <FilteredList
                type='skus'
                query={{
                  filters: { id_eq: excludedIds }
                }}
                ItemTemplate={(props) => (
                  <ListItemSku
                    onSelect={(resource) => {
                      onConfirm(resource)
                      close()
                      navigate(`?`, {
                        replace: true
                      })
                    }}
                    {...props}
                  />
                )}
                emptyState={
                  <ListEmptyState
                    scope={hasActiveFilter ? 'noSKUsFiltered' : 'noSKUs'}
                  />
                }
                hideTitle
              />
            </Card>
          </PageLayout>
        </OverlayElement>
      )
    }
  }
}
