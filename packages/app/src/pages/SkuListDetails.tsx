import {
  Button,
  Dropdown,
  DropdownItem,
  EmptyState,
  InputReadonly,
  PageLayout,
  ResourceList,
  Section,
  SkeletonTemplate,
  Spacer,
  goBack,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

import { ListItemSkuListItem } from '#components/ListItemSkuListItem'
import { appRoutes, type PageProps } from '#data/routes'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import { useState } from 'react'

export const SkuListDetails = (
  props: PageProps<typeof appRoutes.details>
): JSX.Element => {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const skuListId = props.params?.skuListId ?? ''

  const { skuList, isLoading, error } = useSkuListDetails(skuListId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const [isDeleteting, setIsDeleting] = useState(false)

  if (error != null) {
    return (
      <PageLayout
        title={skuList?.name}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: 'SKU Lists',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = skuList?.name

  const contextMenuDelete = canUser('destroy', 'sku_lists') && (
    <DropdownItem
      label='Delete'
      onClick={() => {
        open()
      }}
    />
  )

  const contextMenu = <Dropdown dropdownItems={<>{contextMenuDelete}</>} />

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.list.makePath({})
          })
        },
        label: 'SKU Lists',
        icon: 'arrowLeft'
      }}
      actionButton={contextMenu}
      scrollToTop
      gap='only-top'
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='12' bottom='4'>
          <Section title='Items'>
            {skuList.manual === true ? (
              <ResourceList
                type='sku_list_items'
                query={{
                  filters: { sku_list_id_eq: skuListId },
                  include: ['sku'],
                  sort: {
                    created_at: 'desc'
                  }
                }}
                emptyState={<></>}
                ItemTemplate={ListItemSkuListItem}
              />
            ) : (
              <InputReadonly
                value={skuList.sku_code_regex ?? ''}
                hint={{
                  text: 'Matching SKU codes are automatically included to this list.'
                }}
              />
            )}
          </Section>
        </Spacer>
      </SkeletonTemplate>
      {canUser('destroy', 'sku_lists') && (
        <Overlay backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to cancel the SKU list (${skuList?.name}).`}
            description='This action cannot be undone, proceed with caution.'
            minHeight={false}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: `Cancel`,
              icon: 'x'
            }}
          >
            <Button
              variant='danger'
              size='small'
              disabled={isDeleteting}
              onClick={(e) => {
                setIsDeleting(true)
                e.stopPropagation()
                void sdkClient.sku_lists
                  .delete(skuList.id)
                  .then(() => {
                    setLocation(appRoutes.list.makePath({}))
                  })
                  .catch(() => {})
              }}
              fullWidth
            >
              Delete SKU list
            </Button>
          </PageLayout>
        </Overlay>
      )}
    </PageLayout>
  )
}
