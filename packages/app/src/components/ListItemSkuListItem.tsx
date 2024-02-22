import { makeSkuListItem } from '#mocks'
import {
  Avatar,
  Icon,
  InputSpinner,
  ListItem,
  Text,
  withSkeletonTemplate,
  type ListItemProps
} from '@commercelayer/app-elements'
import type { SkuListItem } from '@commercelayer/sdk'

interface Props {
  resource?: SkuListItem
  variant?: ListItemProps['variant']
  onQuantityChange?: (resource: SkuListItem, quantity: number) => void
  isLoading?: boolean
  delayMs?: number
}

export const ListItemSkuListItem = withSkeletonTemplate<Props>(
  ({
    resource = makeSkuListItem(),
    variant = 'list',
    onQuantityChange
  }): JSX.Element | null => {
    return (
      <ListItem
        tag='div'
        icon={
          <Avatar
            alt={resource.sku?.name ?? ''}
            src={resource.sku?.image_url as `https://${string}`}
          />
        }
        variant={variant}
        alignItems={variant === 'list' ? 'bottom' : 'center'}
        className='bg-white'
      >
        <div>
          <Text tag='div' weight='medium' variant='info' size='small'>
            {resource.sku?.code}
          </Text>
          <Text tag='div' weight='semibold'>
            {resource.sku?.name}
          </Text>
        </div>
        {variant === 'list' && (
          <Text weight='semibold'>x {resource.quantity}</Text>
        )}
        {variant === 'card' && (
          <div className='flex items-center gap-4'>
            <InputSpinner
              defaultValue={resource.quantity ?? 1}
              min={1}
              disableKeyboard
              onChange={(newQuantity) => {
                if (onQuantityChange != null) {
                  onQuantityChange(resource, newQuantity)
                }
              }}
            />
            <button>
              <Icon name='x' size='18' weight='bold' className='text-primary' />
            </button>
          </div>
        )}
      </ListItem>
    )
  }
)
