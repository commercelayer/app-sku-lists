import {
  Avatar,
  Icon,
  ListItem,
  Text,
  withSkeletonTemplate,
  type ListItemProps
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import { makeSku } from 'src/mocks/resources/skus'

interface Props {
  resource?: Sku
  variant: ListItemProps['variant']
  onSelect?: (resource: Sku) => void
}

export const ListItemSku = withSkeletonTemplate<Props>(
  ({ resource = makeSku(), variant, onSelect }) => {
    return (
      <ListItem
        tag='a'
        onClick={(e) => {
          e.preventDefault()
          if (onSelect != null) {
            onSelect(resource)
          }
        }}
        icon={
          <Avatar
            alt={resource.name}
            src={resource.image_url as `https://${string}`}
          />
        }
        className='bg-white'
        variant={variant}
      >
        <div>
          <Text tag='div' variant='info' weight='semibold'>
            {resource.code}
          </Text>
          <Text tag='div' weight='bold'>
            {resource.name}
          </Text>
        </div>
        {variant === 'card' && (
          <Icon name='x' size='18' weight='bold' className='text-primary' />
        )}
      </ListItem>
    )
  }
)
