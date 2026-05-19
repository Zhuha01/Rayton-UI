/**
 * Management Two Column Grid within the Rayton operator UI (components_2/Pages/management/cards/ManagementTwoColumnGrid.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Flex, VStack, useBreakpointValue } from '@chakra-ui/react'
import { type ReactNode, useMemo } from 'react'
import { splitItemsForTwoColumns } from './splitItemsForTwoColumns'

export interface ManagementTwoColumnGridProps<T> {
  items: T[]
  getKey: (item: T) => string
  renderCard: (item: T) => ReactNode
  /** Vertical gap between cards */
  cardGap?: number | string
  /** Horizontal gap between the two desktop columns */
  columnGap?: number | string
  /** Placeholder opacity while paginated data resolves */
  listOpacity?: number
}

export function ManagementTwoColumnGrid<T>({
  items,
  getKey,
  renderCard,
  cardGap = 6,
  columnGap = 6,
  listOpacity = 1,
}: ManagementTwoColumnGridProps<T>) {
  const isDesktop =
    useBreakpointValue({ base: false, md: true }, { ssr: false }) ?? false

  const { left, right } = useMemo(
    () => splitItemsForTwoColumns(items),
    [items]
  )

  if (!isDesktop) {
    return (
      <VStack gap={cardGap} align="stretch" w="full" opacity={listOpacity}>
        {items.map((item) => (
          <div key={getKey(item)}>{renderCard(item)}</div>
        ))}
      </VStack>
    )
  }

  return (
    <Flex gap={columnGap} align="flex-start" w="full" opacity={listOpacity}>
      <VStack flex="1" minW={0} gap={cardGap} align="stretch">
        {left.map((item) => (
          <div key={getKey(item)}>{renderCard(item)}</div>
        ))}
      </VStack>
      <VStack flex="1" minW={0} gap={cardGap} align="stretch">
        {right.map((item) => (
          <div key={getKey(item)}>{renderCard(item)}</div>
        ))}
      </VStack>
    </Flex>
  )
}
