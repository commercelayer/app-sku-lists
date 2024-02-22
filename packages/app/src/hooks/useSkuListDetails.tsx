import { isMockedId, makeSkuList } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { SkuList } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function useSkuListDetails(id: string): {
  skuList: SkuList
  isLoading: boolean
  error: any
  mutateSkuList: KeyedMutator<SkuList>
} {
  const {
    data: skuList,
    isLoading,
    error,
    mutate: mutateSkuList
  } = useCoreApi(
    'sku_lists',
    'retrieve',
    [
      id,
      {
        include: ['sku_list_items', 'sku_list_items.sku']
      }
    ],
    {
      isPaused: () => isMockedId(id),
      fallbackData: makeSkuList()
    }
  )

  return { skuList, error, isLoading, mutateSkuList }
}
