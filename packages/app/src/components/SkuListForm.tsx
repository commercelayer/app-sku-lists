import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import { makeSkuListItem } from '#mocks'
import {
  Button,
  ButtonCard,
  HookedForm,
  HookedInput,
  HookedValidationApiError,
  HookedValidationError,
  Section,
  Spacer
} from '@commercelayer/app-elements'
import type { SkuList, SkuListItem } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { ListItemSkuListItem } from './ListItemSkuListItem'

const skuListFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  manual: z.boolean().default(true),
  items: z.array(z.custom<SkuList>()).optional(),
  sku_code_regex: z.string().optional()
})

export type SkuListFormValues = z.infer<typeof skuListFormSchema>

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

  const [selectedItems, setSelectedItems] = useState<SkuListItem[]>([])
  const selectedItemsIds = useMemo(() => {
    console.log(selectedItems)
    const excludedIds = [] as string[]
    selectedItems.forEach((sku) => {
      excludedIds.push(sku.id)
    })
    return excludedIds.join(',') ?? ''
  }, [selectedItems])

  useEffect(() => {
    if (resource != null) {
      resource.sku_list_items?.forEach((item) => {
        setSelectedItems([...selectedItems, item])
      })
    }
  }, [resource])

  console.log(skuListFormMethods.watch('manual'));

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
          <Spacer top='6' bottom='4'>
            <>
              {selectedItems.map((item, idx) => (
                <Spacer top='2' key={idx}>
                  <ListItemSkuListItem
                    resource={item}
                    variant='card'
                    onQuantityChange={(resource, quantity) => {
                      const updatedSelectedItems: SkuListItem[] = []
                      selectedItems.forEach((item) => {
                        if (item.id === resource.id) {
                          item.quantity = quantity
                        }
                        updatedSelectedItems.push(item)
                      })
                      setSelectedItems(updatedSelectedItems)
                    }}
                    onRemoveClick={(resource) => {
                      const updatedSelectedItems: SkuListItem[] = []
                      selectedItems.forEach((item) => {
                        if (item.id !== resource.id) {
                          updatedSelectedItems.push(item)
                        }
                      })
                      setSelectedItems(updatedSelectedItems)
                    }}
                  />
                </Spacer>
              ))}
            </>
            <Spacer top='2'>
              <ButtonCard
                iconLabel='Add item'
                padding='4'
                fullWidth
                onClick={() => {
                  showAddItemOverlay(selectedItemsIds)
                }}
              />
            </Spacer>
            <Spacer top='2'>
              <HookedValidationError name='items' />
            </Spacer>
            <AddItemOverlay
              onConfirm={(selectedSku) => {
                const newSkuListItem = makeSkuListItem()
                newSkuListItem.quantity = 1
                newSkuListItem.sku = selectedSku
                newSkuListItem.sku_code = selectedSku.code
                setSelectedItems([...selectedItems, newSkuListItem])
              }}
            />
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
