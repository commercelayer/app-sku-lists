import { SkuListForm, type SkuListFormValues } from '#components/SkuListForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type SkuListCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function SkuListNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl = appRoutes.list.makePath({})

  if (!canUser('create', 'sku_lists')) {
    return (
      <PageLayout
        title='New SKU list'
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
      title={<>New SKU list</>}
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
        <SkuListForm
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const skuList = adaptFormValuesToSkuList(formValues)
            void sdkClient.sku_lists
              .create(skuList)
              .then(() => {
                setLocation(goBackUrl)
              })
              .catch((error) => {
                setApiError(error)
                setIsSaving(false)
              })
          }}
        />
      </Spacer>
    </PageLayout>
  )
}

function adaptFormValuesToSkuList(
  formValues: SkuListFormValues
): SkuListCreate {
  return {
    name: formValues.name
  }
}
