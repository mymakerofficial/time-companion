import Color from "color";
import colors from "tailwindcss/colors";
import type {Maybe} from "@/lib/utils";
import {isNotDefined} from "@/lib/utils";
import type {DefaultColors} from "tailwindcss/types/generated/colors";

function getHsl(color: string, shade: number) {
  // be warned, ugly code ahead
  const [h, s, l] = (
    Color(colors
      [color as keyof typeof colors]
      [shade.toString() as keyof typeof colors['neutral']]
    ).hsl() as unknown as  { color: [number, number, number] }
  ).color
  return { h, s, l }
}

export const vProvideColor = {
  mounted(el: HTMLElement, { value: color }: { value: Maybe<string> }) {
    if (isNotDefined(color)) {
      return
    }

    if (isNotDefined(colors[color as keyof typeof colors])) {
      return
    }

    const surfaceShade = 400
    const foregroundShade = 950

    const surfaceColor = getHsl(color, surfaceShade)
    const foregroundColor = getHsl(color, foregroundShade)

    el.style.setProperty('--primary', `${surfaceColor.h} ${surfaceColor.s}% ${surfaceColor.l}%`)
    el.style.setProperty('--primary-foreground', `${foregroundColor.h} ${foregroundColor.s}% ${foregroundColor.l}%`)
  }
}