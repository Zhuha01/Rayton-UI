/**
 * Opinionated login/auth input with optional start icon and password toggle affordances.
 * Composes Field, InputGroup, and Chakra Input with coordinated border styles for validation states.
 */

import { Box, IconButton, Input, type InputProps, Text } from "@chakra-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { Field } from "@/components_2/ui/Field"
import { InputGroup } from "@/components_2/ui/InputGroup"

interface InputCustomProps extends InputProps {
  label?: string
  icon?: any
  errorText?: string
  invalid?: boolean
  register?: any
  /** Leading icon color (non-password fields); overrides `text.muted` when set. */
  iconIdleColor?: string
  /** SVG icon color on focus within the group; typically white on dark forms. */
  focusWithinIconColor?: string
  /** Password field: lock / visibility icon color. */
  passwordMutedColor?: string
}

export function InputCustom(props: InputCustomProps) {
  const {
    label,
    icon,
    type = "text",
    errorText,
    invalid,
    register,
    iconIdleColor,
    focusWithinIconColor,
    passwordMutedColor,
    ...rest
  } = props

  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const resolvedType = isPassword && showPassword ? "text" : type

  const startElement = icon ? (
    <Box
      as={icon}
      boxSize={isPassword ? "18px" : "16px"}
      color={
        isPassword ? "currentColor" : (iconIdleColor ?? "text.muted")
      }
    />
  ) : undefined

  return (
    <Field
      label={
        label ? (
          <Text fontSize="0.875rem" fontWeight="normal">
            {label}
          </Text>
        ) : undefined
      }
      invalid={invalid}
      errorText={errorText}
    >
      <InputGroup
        w="100%"
        _focusWithin={{
          "& svg": { color: focusWithinIconColor ?? "white" },
        }}
        startElement={startElement}
        startElementProps={
          isPassword
            ? { color: passwordMutedColor ?? "text.muted" }
            : undefined
        }
        endElementProps={
          isPassword
            ? { color: passwordMutedColor ?? "text.muted" }
            : undefined
        }
        endElement={
          isPassword ? (
            <IconButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              variant="ghost"
              minW="auto"
              h="auto"
              type="button"
              color={passwordMutedColor ?? "text.muted"}
              _hover={{
                color: passwordMutedColor ?? "text.muted",
                bg: "transparent",
              }}
              _focusVisible={{ boxShadow: "none !important" }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <Box
                as={showPassword ? Eye : EyeOff}
                boxSize="18px"
                color="currentColor"
              />
            </IconButton>
          ) : undefined
        }
      >
        <Input
          {...register}
          {...rest}
          type={resolvedType}
          h="44px"
          ps={rest.ps ?? (icon ? "42px" : "16px")}
          pe={rest.pe ?? (isPassword ? "42px" : undefined)}
          fontFamily="Inter"
          fontWeight="normal"
          fontSize="0.875rem"
          _placeholder={{ color: "text.muted", ...rest._placeholder }}
          bg={rest.bg ?? "background.normal"}
          color={rest.color ?? "white"}
          borderWidth="1px"
          borderColor={rest.borderColor ?? "text.muted"}
          borderRadius={rest.borderRadius ?? "8px"}
          boxShadow="none !important"
          transition="border-color 0.2s ease"
          _invalid={{
            borderColor: "red.500",
            _focus: { borderColor: "white" },
          }}
          _hover={{
            borderColor: invalid ? "red.500" : "white",
            ...rest._hover,
            ...(invalid ? { borderColor: "red.500" } : {}),
          }}
          _focus={{
            borderColor: "white !important", // Force white on focus
            outline: "none",
            ...rest._focus,
          }}
          _focusVisible={{
            borderColor: "white !important",
            outline: "none",
            ...rest._focusVisible,
          }}
        />
      </InputGroup>
    </Field>
  )
}
