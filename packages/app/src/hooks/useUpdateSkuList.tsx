import type { SkuListFormValues } from '#components/SkuListForm'
import {
  adaptFormListItemToSkuListItemCreate,
  adaptFormValuesToSkuListUpdate
} from '#components/SkuListForm/utils'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { useCallback, useState } from 'react'

interface UpdateSkuListHook {
  isUpdatingSkuList: boolean
  updateSkuListError?: any
  updateSkuList: (formValues: SkuListFormValues) => Promise<void>
}

export function useUpdateSkuList(): UpdateSkuListHook {
  const { sdkClient } = useCoreSdkProvider()

  const [isUpdatingSkuList, setIsUpdatingSkuList] = useState(false)
  const [updateSkuListError, setUpdateSkuListError] =
    useState<UpdateSkuListHook['updateSkuListError']>()

  const updateSkuList = useCallback<UpdateSkuListHook['updateSkuList']>(
    async (formValues) => {
      setIsUpdatingSkuList(true)
      setUpdateSkuListError(undefined)

      try {
        const skuList = adaptFormValuesToSkuListUpdate(formValues)
        const updatedSkuList = await sdkClient.sku_lists.update(skuList, {
          include: ['sku_list_items', 'sku_list_items.sku']
        })
        if (formValues.manual && updatedSkuList.id != null) {
          // Create or update items
          await Promise.all(
            formValues.items.map(async (item) => {
              const itemNeedsUpdate = updatedSkuList.sku_list_items?.find(
                (skuListItem) =>
                  skuListItem.sku_code === item.sku_code &&
                  skuListItem.quantity !== item.quantity
              )
              // Item needs to be updated
              if (itemNeedsUpdate != null) {
                await sdkClient.sku_list_items.update({
                  id: itemNeedsUpdate.id,
                  quantity: item.quantity
                })
              }
              const itemIsAlreadyExisting = updatedSkuList.sku_list_items?.find(
                (skuListItem) => skuListItem.sku_code === item.sku_code
              )
              // Item needs to be created
              if (itemIsAlreadyExisting == null) {
                const skuListItem = adaptFormListItemToSkuListItemCreate(
                  item,
                  updatedSkuList.id,
                  sdkClient
                )
                await sdkClient.sku_list_items.create(skuListItem)
              }
            })
          )
          // Check if any of the old items needs to be removed
          if (updatedSkuList.sku_list_items != null) {
            await Promise.all(
              updatedSkuList.sku_list_items?.map(async (oldItem) => {
                const itemIsInNewListItems = formValues.items.find(
                  (item) => item.sku_code === oldItem.sku_code
                )
                if (itemIsInNewListItems == null) {
                  await sdkClient.sku_list_items.delete(oldItem.id)
                }
              })
            )
          }
        }
      } catch (err) {
        setUpdateSkuListError(err)
      } finally {
        setIsUpdatingSkuList(false)
      }
    },
    []
  )

  return {
    isUpdatingSkuList,
    updateSkuListError,
    updateSkuList
  }
}
