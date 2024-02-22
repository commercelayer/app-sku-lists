import { SkuListForm, type SkuListFormValues } from '#components/SkuListForm'
import { appRoutes } from '#data/routes'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type SkuListUpdate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function SkuListEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const [, params] = useRoute<{ skuListId: string }>(appRoutes.edit.path)
  const skuListId = params?.skuListId ?? ''

  const { skuList, isLoading, mutateSkuList } = useSkuListDetails(skuListId)

  const goBackUrl = appRoutes.details.makePath({ skuListId })

  if (!canUser('update', 'sku_lists')) {
    return (
      <PageLayout
        title='Edit SKU list'
        navigationButton={{
          onClick: () => {
            setLocation(goBackUrl)
          },
          label: 'Cancel',
          icon: 'x'
        }}
        scrollToTop
      >
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>Edit SKU list</SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: 'Cancel',
        icon: 'x'
      }}
      gap='only-top'
      scrollToTop
      overlay
    >
      <Spacer bottom='14'>
        {!isLoading && skuList != null ? (
          <SkuListForm
            resource={skuList}
            defaultValues={{
              id: skuList.id,
              name: skuList.name
            }}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              const skuList = adaptFormValuesToSkuList(formValues)
              void sdkClient.sku_lists
                .update(skuList)
                .then((updatedSkuList) => {
                  setLocation(goBackUrl)
                  void mutateSkuList({ ...updatedSkuList })
                })
                .catch((error) => {
                  setApiError(error)
                  setIsSaving(false)
                })
            }}
          />
        ) : null}
      </Spacer>
    </PageLayout>
  )
}

function adaptFormValuesToSkuList(
  formValues: SkuListFormValues
): SkuListUpdate {
  return {
    id: formValues.id ?? '',
    name: formValues.name
  }
}
