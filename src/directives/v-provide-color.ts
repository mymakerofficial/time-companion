import Color from "color";
import colors from "tailwindcss/colors";

export const vProvideColor = {
  mounted(el: HTMLElement, { value }: { value: string | null }) {
    if (!value) {
      return
    }

    if (!colors[value as keyof typeof colors]) {
      return
    }

    const { color: surfaceColor } = Color(colors[value as keyof typeof colors][400]).hsl()
    const { color: foregroundColor } = Color(colors[value as keyof typeof colors][950]).hsl()

    el.style.setProperty('--primary', `${surfaceColor[0]} ${surfaceColor[1]}% ${surfaceColor[2]}%`)
    el.style.setProperty('--primary-foreground', `${foregroundColor[0]} ${foregroundColor[1]}% ${foregroundColor[2]}%`)
  }
}