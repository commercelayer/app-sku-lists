import type { SkuListFormValues } from '#components/SkuListForm'
import {
  adaptFormListItemToSkuListItemCreate,
  adaptFormValuesToSkuListCreate
} from '#components/SkuListForm/utils'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { useCallback, useState } from 'react'

interface CreateSkuListHook {
  isCreatingSkuList: boolean
  createSkuListError?: any
  createSkuList: (formValues: SkuListFormValues) => Promise<void>
}

export function useCreateSkuList(): CreateSkuListHook {
  const { sdkClient } = useCoreSdkProvider()

  const [isCreatingSkuList, setIsCreatingSkuList] = useState(false)
  const [createSkuListError, setCreateSkuListError] =
    useState<CreateSkuListHook['createSkuListError']>()

  const createSkuList: CreateSkuListHook['createSkuList'] = useCallback(
    async (formValues) => {
      setIsCreatingSkuList(true)
      setCreateSkuListError(undefined)

      const skuList = adaptFormValuesToSkuListCreate(formValues)
      try {
        const createdSkuList = await sdkClient.sku_lists.create(skuList)
        if (formValues.manual && createdSkuList.id != null) {
          await Promise.all(
            formValues.items.map(async (item) => {
              const skuListItem = adaptFormListItemToSkuListItemCreate(
                item,
                createdSkuList.id,
                sdkClient
              )
              await sdkClient.sku_list_items.create(skuListItem)
            })
          )
        }
      } catch (err) {
        setCreateSkuListError(err)
      } finally {
        setIsCreatingSkuList(false)
      }
    },
    []
  )

  return {
    isCreatingSkuList,
    createSkuListError,
    createSkuList
  }
}
