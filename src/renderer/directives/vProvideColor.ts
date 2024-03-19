import Color from 'color'
import colors from 'tailwindcss/colors'
import type { Maybe, Nullable } from '@renderer/lib/utils'
import { isNotDefined, round } from '@renderer/lib/utils'
import type { DefaultColors } from 'tailwindcss/types/generated/colors'

type ColorName = Omit<
  keyof DefaultColors,
  'inherit' | 'current' | 'transparent' | 'black' | 'white'
>
type ColorShade = keyof (typeof colors)['neutral']

type Hsl = {
  h: number
  s: number
  l: number
}

type HslString = `${number} ${number}% ${number}%`

type ColorStyleVariable<VariablePrefix extends string> = {
  property:
    | `--${VariablePrefix}`
    | `--${VariablePrefix}-foreground`
    | `--${VariablePrefix}-${ColorShade}`
  value: Nullable<HslString>
}

const shades = Object.keys(colors['neutral']) as ColorShade[]

function getHsl(color: ColorName, shade: ColorShade): Hsl {
  const [h, s, l] = (
    Color(colors[color as keyof typeof colors][shade]).hsl() as unknown as {
      color: [number, number, number]
    }
  ).color
  return { h, s, l }
}

function hslToString(color: Hsl): HslString {
  return `${round(color.h, 2)} ${round(color.s, 2)}% ${round(color.l, 2)}%`
}

function getEmptyColorStyleVariables<VariablePrefix extends string>(
  variablePrefix: VariablePrefix,
): ColorStyleVariable<VariablePrefix>[] {
  return [
    { property: `--${variablePrefix}`, value: null },
    { property: `--${variablePrefix}-foreground`, value: null },
    ...shades.map(
      (shade) =>
        ({
          property: `--${variablePrefix}-${shade}`,
          value: null,
        }) as ColorStyleVariable<VariablePrefix>,
    ),
  ]
}

export function getColorStyleVariables<VariablePrefix extends string>({
  color,
  variablePrefix,
}: {
  color: Maybe<ColorName>
  variablePrefix: VariablePrefix
}): ColorStyleVariable<VariablePrefix>[] {
  if (
    isNotDefined(color) ||
    isNotDefined(colors[color as keyof typeof colors])
  ) {
    return getEmptyColorStyleVariables(variablePrefix)
  }

  const surfaceShade: ColorShade = '400'
  const foregroundShade: ColorShade = '950'

  const surfaceColor = hslToString(getHsl(color, surfaceShade))
  const foregroundColor = hslToString(getHsl(color, foregroundShade))

  const colorShades: ColorStyleVariable<VariablePrefix>[] = shades.map(
    (shade) => ({
      property: `--${variablePrefix}-${shade}`,
      value: hslToString(getHsl(color, shade)),
    }),
  )

  return [
    { property: `--${variablePrefix}`, value: surfaceColor },
    { property: `--${variablePrefix}-foreground`, value: foregroundColor },
    ...colorShades,
  ]
}

function update({
  el,
  color,
  variablePrefix = 'color',
}: {
  el: HTMLElement
  color: Maybe<ColorName>
  variablePrefix?: string
}) {
  const style = getColorStyleVariables({ color, variablePrefix })

  style.forEach(({ property, value }) => {
    el.style.setProperty(property, value ?? null)
  })
}

export const vProvideColor = {
  mounted(el: HTMLElement, { value: color }: { value: Maybe<string> }) {
    update({
      el,
      color,
    })
  },
  updated(el: HTMLElement, { value: color }: { value: Maybe<string> }) {
    update({
      el,
      color,
    })
  },
}
