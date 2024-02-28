import { ListItemCardSkuListItem } from '#components/ListItemCardSkuListItem'
import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import {
  Button,
  ButtonCard,
  HookedForm,
  HookedInput,
  HookedInputTextArea,
  HookedValidationApiError,
  HookedValidationError,
  Section,
  Spacer,
  Tab,
  Tabs,
  type TabsProps
} from '@commercelayer/app-elements'
import type { SkuList } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { type z } from 'zod'
import { skuListFormSchema } from './schema'
import { makeFormSkuListItem } from './utils'

export type SkuListFormValues = z.infer<typeof skuListFormSchema>

export interface FormSkuListItem {
  id: string
  sku_code: string
  quantity: number
  sku: { id: string; code: string; name: string; image_url: string }
}

interface Props {
  resource?: SkuList
  defaultValues?: Partial<SkuListFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: SkuListFormValues,
    setError: UseFormSetError<SkuListFormValues>
  ) => void
  apiError?: any
}

export function SkuListForm({
  resource,
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const skuListFormMethods = useForm<SkuListFormValues>({
    defaultValues,
    resolver: zodResolver(skuListFormSchema)
  })

  const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
    useAddItemOverlay()

  const watchedFormItems = skuListFormMethods.watch('items')
  const watchedFormManual = skuListFormMethods.watch('manual')
  const defaultTab = useMemo(() => {
    return watchedFormManual ? 0 : 1
  }, [watchedFormManual])

  // const selectedItemsCodes = useMemo(() => {
  //   const excludedCodes = [] as string[]
  //   watchedFormItems?.forEach((sku) => {
  //     excludedCodes.push(sku.sku_code)
  //   })
  //   return excludedCodes.join(',') ?? ''
  // }, [watchedFormItems])
  // console.log(selectedItemsCodes)

  useEffect(() => {
    if (resource != null) {
      const selectedItems = skuListFormMethods.getValues('items') ?? []
      resource.sku_list_items?.forEach((item) => {
        if (
          selectedItems.filter(
            (selectedItem) => selectedItem.sku_code === item.sku_code
          ).length === 0
        ) {
          selectedItems?.push(makeFormSkuListItem(item))
        }
      })
      skuListFormMethods.setValue('items', selectedItems)
    }
  }, [resource])

  const handleOnTabSwitch = useCallback<NonNullable<TabsProps['onTabSwitch']>>(
    (activeTab) => {
      if (activeTab === 0 && !watchedFormManual) {
        skuListFormMethods.setValue('manual', true)
        skuListFormMethods.setValue('sku_code_regex', '')
      }
      if (activeTab === 1 && watchedFormManual) {
        skuListFormMethods.setValue('manual', false)
        skuListFormMethods.setValue('items', [])
      }
    },
    [skuListFormMethods, watchedFormManual]
  )

  return (
    <>
      <HookedForm
        {...skuListFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, skuListFormMethods.setError)
        }}
      >
        <Section>
          <Spacer top='12' bottom='4'>
            <HookedInput
              name='name'
              label='Name'
              type='text'
              hint={{ text: 'Pick a name that helps you identify it.' }}
            />
          </Spacer>
          <Spacer top='12' bottom='4'>
            <Tabs
              onTabSwitch={handleOnTabSwitch}
              keepAlive
              defaultTab={defaultTab}
            >
              <Tab name='Manual'>
                {watchedFormItems?.map((item, idx) => (
                  <Spacer top='2' key={idx}>
                    <ListItemCardSkuListItem
                      resource={item}
                      onQuantityChange={(resource, quantity) => {
                        const updatedSelectedItems: FormSkuListItem[] = []
                        watchedFormItems.forEach((item) => {
                          if (item.sku_code === resource.sku_code) {
                            item.quantity = quantity
                          }
                          updatedSelectedItems.push(item)
                        })
                        skuListFormMethods.setValue(
                          'items',
                          updatedSelectedItems
                        )
                      }}
                      onRemoveClick={(resource) => {
                        const updatedSelectedItems: FormSkuListItem[] = []
                        watchedFormItems.forEach((item) => {
                          if (item.sku_code !== resource.sku_code) {
                            updatedSelectedItems.push(item)
                          }
                        })
                        skuListFormMethods.setValue(
                          'items',
                          updatedSelectedItems
                        )
                      }}
                    />
                  </Spacer>
                ))}
                <Spacer top='2'>
                  <ButtonCard
                    iconLabel='Add item'
                    padding='4'
                    fullWidth
                    onClick={() => {
                      showAddItemOverlay('')
                    }}
                  />
                </Spacer>
                <Spacer top='2'>
                  <HookedValidationError name='items' />
                </Spacer>
                <AddItemOverlay
                  onConfirm={(selectedSku) => {
                    const selectedItems =
                      skuListFormMethods.getValues('items') ?? []
                    if (
                      selectedItems.find(
                        (item) => item.sku_code === selectedSku.code
                      ) == null
                    ) {
                      const newSkuListItem = {
                        id: '',
                        sku_code: selectedSku.code,
                        quantity: 1,
                        sku: {
                          id: selectedSku.id,
                          code: selectedSku.code,
                          name: selectedSku.name,
                          image_url: selectedSku.image_url ?? ''
                        }
                      }
                      selectedItems?.push(newSkuListItem)
                      skuListFormMethods.setValue('items', selectedItems)
                    }
                  }}
                />
              </Tab>
              <Tab name='Automatic'>
                <HookedInputTextArea
                  name='sku_code_regex'
                  hint={{
                    text: 'Use regular expressions for matching SKU codes, such as "AT | BE".'
                  }}
                />
              </Tab>
            </Tabs>
          </Spacer>
        </Section>
        <Spacer top='14'>
          <Button type='submit' disabled={isSubmitting} fullWidth>
            {defaultValues?.id == null ? 'Create' : 'Update'}
          </Button>
          <Spacer top='2'>
            <HookedValidationApiError apiError={apiError} />
          </Spacer>
        </Spacer>
      </HookedForm>
    </>
  )
}
