/**
 * Pagination within the Rayton operator UI (components_2/ui/Pagination.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
"use client"


import type { ButtonProps, TextProps } from "@chakra-ui/react"
import {
  Box,
  Button,
  Pagination as ChakraPagination,
  IconButton,
  Text,
  createContext,
  usePaginationContext,
} from "@chakra-ui/react"
import * as React from "react"
import { HiMiniEllipsisHorizontal } from "react-icons/hi2"
import { LinkButton } from "@/components_2/ui/LinkButton"

interface ButtonVariantMap {
  current: ButtonProps["variant"]
  default: ButtonProps["variant"]
  ellipsis: ButtonProps["variant"]
}

type PaginationVariant = "outline" | "solid" | "subtle"

interface ButtonVariantContext {
  size: ButtonProps["size"]
  variantMap: ButtonVariantMap
  getHref?: (page: number) => string
}

const [RootPropsProvider, useRootProps] = createContext<ButtonVariantContext>({
  name: "RootPropsProvider",
})

export interface PaginationRootProps
  extends Omit<ChakraPagination.RootProps, "type"> {
  size?: ButtonProps["size"]
  variant?: PaginationVariant
  getHref?: (page: number) => string
}

const variantMap: Record<PaginationVariant, ButtonVariantMap> = {
  outline: { default: "ghost", ellipsis: "plain", current: "outline" },
  solid: { default: "outline", ellipsis: "outline", current: "solid" },
  subtle: { default: "ghost", ellipsis: "plain", current: "subtle" },
}

const paginationButtonProps = {
  fontSize: "14px",
  fontWeight: "semibold",
  color: "ui.Pagination.itemText",
  w: "35px",
  h: "35px",
  minW: "35px",
  p: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  border: "none",
  bg: "transparent",
  _hover: { bg: "ui.Pagination.itemHoverBg" },
  _active: { bg: "ui.Pagination.itemHoverBg" },
} as const satisfies Partial<ButtonProps>

const MaskedArrowIcon = (props: { rotated?: boolean }) => {
  const { rotated } = props
  return (
    <Box
      aria-hidden
      w="6px"
      h="11px"
      bg="currentColor"
      transform={rotated ? "rotate(-180deg)" : undefined}
      style={
        {
          maskImage: "url(/assets/icons/str.svg)",
          WebkitMaskImage: "url(/assets/icons/str.svg)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        } as React.CSSProperties
      }
    />
  )
}

export const PaginationRoot = React.forwardRef<
  HTMLDivElement,
  PaginationRootProps
>(function PaginationRoot(props, ref) {
  const { size = "sm", variant = "outline", getHref, ...rest } = props
  return (
    <RootPropsProvider value={{ size, variantMap: variantMap[variant], getHref }}>
      <ChakraPagination.Root
        ref={ref}
        type={getHref ? "link" : "button"}
        {...rest}
      />
    </RootPropsProvider>
  )
})

export const PaginationEllipsis = React.forwardRef<
  HTMLDivElement,
  ChakraPagination.EllipsisProps
>(function PaginationEllipsis(props, ref) {
  const { size, variantMap } = useRootProps()
  return (
    <ChakraPagination.Ellipsis ref={ref} {...props} asChild>
      <Button
        as="span"
        size={size}
        variant={variantMap.ellipsis}
        {...paginationButtonProps}
      >
        <HiMiniEllipsisHorizontal />
      </Button>
    </ChakraPagination.Ellipsis>
  )
})

export const PaginationItem = React.forwardRef<
  HTMLButtonElement,
  ChakraPagination.ItemProps
>(function PaginationItem(props, ref) {
  const { page } = usePaginationContext()
  const { size, variantMap, getHref } = useRootProps()

  const current = page === props.value
  const variant = current ? variantMap.current : variantMap.default
  const hoverBg = current ? "ui.Pagination.itemBg" : "ui.Pagination.itemHoverBg"

  if (getHref) {
    return (
      <LinkButton
        href={getHref(props.value)}
        variant={variant}
        size={size}
        {...paginationButtonProps}
        bg={current ? "ui.Pagination.itemBg" : "transparent"}
        _hover={{ bg: hoverBg }}
        _active={{ bg: hoverBg }}
      >
        {props.value}
      </LinkButton>
    )
  }

  return (
    <ChakraPagination.Item ref={ref} {...props} asChild>
      <Button
        variant={variant}
        size={size}
        {...paginationButtonProps}
        bg={current ? "ui.Pagination.itemBg" : "transparent"}
        _hover={{ bg: hoverBg }}
        _active={{ bg: hoverBg }}
      >
        {props.value}
      </Button>
    </ChakraPagination.Item>
  )
})

export const PaginationPrevTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraPagination.PrevTriggerProps
>(function PaginationPrevTrigger(props, ref) {
  const { size, variantMap, getHref } = useRootProps()
  const { previousPage } = usePaginationContext()

  if (getHref) {
    return (
      <LinkButton
        href={previousPage != null ? getHref(previousPage) : undefined}
        variant={variantMap.default}
        size={size}
        aria-label="Previous page"
        {...paginationButtonProps}
        _disabled={{ color: "ui.Pagination.itemDisabledText" }}
      >
        <MaskedArrowIcon rotated />
      </LinkButton>
    )
  }

  return (
    <ChakraPagination.PrevTrigger ref={ref} asChild {...props}>
      <IconButton
        aria-label="Previous page"
        variant={variantMap.default}
        size={size}
        {...paginationButtonProps}
        _disabled={{ color: "ui.Pagination.itemDisabledText" }}
      >
        <MaskedArrowIcon rotated />
      </IconButton>
    </ChakraPagination.PrevTrigger>
  )
})

export const PaginationNextTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraPagination.NextTriggerProps
>(function PaginationNextTrigger(props, ref) {
  const { size, variantMap, getHref } = useRootProps()
  const { nextPage } = usePaginationContext()

  if (getHref) {
    return (
      <LinkButton
        href={nextPage != null ? getHref(nextPage) : undefined}
        variant={variantMap.default}
        size={size}
        aria-label="Next page"
        {...paginationButtonProps}
        _disabled={{ color: "ui.Pagination.itemDisabledText" }}
      >
        <MaskedArrowIcon />
      </LinkButton>
    )
  }

  return (
    <ChakraPagination.NextTrigger ref={ref} asChild {...props}>
      <IconButton
        aria-label="Next page"
        variant={variantMap.default}
        size={size}
        {...paginationButtonProps}
        _disabled={{ color: "ui.Pagination.itemDisabledText" }}
      >
        <MaskedArrowIcon />
      </IconButton>
    </ChakraPagination.NextTrigger>
  )
})

export const PaginationItems = (props: React.HTMLAttributes<HTMLElement>) => {
  return (
    <ChakraPagination.Context>
      {({ pages }) =>
        pages.map((page, index) => {
          return page.type === "ellipsis" ? (
            <PaginationEllipsis key={index} index={index} {...props} />
          ) : (
            <PaginationItem
              key={index}
              type="page"
              value={page.value}
              {...props}
            />
          )
        })
      }
    </ChakraPagination.Context>
  )
}

interface PageTextProps extends TextProps {
  format?: "short" | "compact" | "long"
}

export const PaginationPageText = React.forwardRef<
  HTMLParagraphElement,
  PageTextProps
>(function PaginationPageText(props, ref) {
  const { format = "compact", ...rest } = props
  const { page, totalPages, pageRange, count } = usePaginationContext()
  const content = React.useMemo(() => {
    if (format === "short") return `${page} / ${totalPages}`
    if (format === "compact") return `${page} of ${totalPages}`
    return `${pageRange.start + 1} - ${Math.min(pageRange.end, count)} of ${count}`
  }, [format, page, totalPages, pageRange, count])

  return (
    <Text fontWeight="medium" ref={ref} {...rest}>
      {content}
    </Text>
  )
})
