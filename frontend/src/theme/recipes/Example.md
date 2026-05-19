<!--
This document explains Chakra UI v3+ recipes: a single file defines all visual variants of a component.
It complements `example.ts` in this folder and is intended for contributors wiring new recipes into the theme.
-->

## What is a recipe?

A **recipe** is a Chakra UI (v3+) pattern that centralizes every visual state (variant) of a component in one place.

Instead of repeating ternaries and manual color switches in each file (for example `isActive ? "green.500" : "red.500"`), you describe the logic once in the recipe and pass short variant names from the component.

## Why use it?

* **Clean JSX:** Components stay readable; you pass `variant` or `size` props.
* **Single source of truth:** When a button or badge design changes, you edit one file under `theme/recipes/` and the app updates consistently.
* **Strong typing:** TypeScript surfaces valid variants so invalid sizes or colors are harder to pass by mistake.

## Recipe anatomy

A recipe has three main parts:

* `base`: Styles that always apply (for example radius or font).
* `variants`: Different states (for example `variant: { solid, outline }` or `size: { sm, md, lg }`).
* `defaultVariants`: Values applied when the caller omits props.

### Code sample: `src/theme/recipes/button.recipe.ts`

```typescript
import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "semibold",
    borderRadius: "8px",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  variants: {
    variant: {
      solid: {
        bg: "rayton_orange.500",
        color: "rayton_black.900",
        _hover: { bg: "rayton_orange.600" },
        _active: { bg: "rayton_orange.400" },
      },
      outline: {
        bg: "transparent",
        border: "1px solid",
        borderColor: "rayton_neutral.500",
        color: "white",
        _hover: { borderColor: "white" },
      },
      ghost: {
        bg: "transparent",
        color: "rayton_neutral.400",
        _hover: { color: "white", bg: "rayton_black.700" },
      },
    },
    size: {
      sm: {
        h: "32px",
        px: "4",
        fontSize: "12px",
      },
      md: {
        h: "44px",
        px: "6",
        fontSize: "14px",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
})
```

## Registering a recipe globally

To activate a recipe, register it in `src/theme/index.ts` under `theme.recipes`:

```typescript
import { createSystem, defaultConfig } from "@chakra-ui/react"
import { buttonRecipe } from "./recipes/button.recipe"

export const system = createSystem(defaultConfig, {
  theme: {
    recipes: {
      button: buttonRecipe,
    },
  },
})
```

## Using recipes from components

After registration, the standard Chakra component (here `<Button>`) picks up the new props.
You **do not** hand-roll the same styles in layout files—call the component with the right parameters:

```tsx
import { Button, Flex } from "@chakra-ui/react"

export const ActionPanel = () => {
  return (
    <Flex gap="4">
      <Button>Sign in</Button>

      <Button variant="outline" size="sm">Cancel</Button>

      <Button variant="ghost" size="md">Learn more</Button>
    </Flex>
  )
}
```
