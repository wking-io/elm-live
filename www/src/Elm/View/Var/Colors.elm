module View.Var.Colors exposing (secondaryDarkest, gradient, primary, primaryDark, primaryLight)

import Css exposing (BackgroundImage, Color, ListStyle)


secondaryDarkest : Color
secondaryDarkest =
    Css.rgb 13 31 45


primary : Color
primary =
    Css.rgb 247 127 0


primaryDark : Color
primaryDark =
    Css.rgb 239 99 0


primaryLight : Color
primaryLight =
    Css.rgb 255 160 28


gradient : BackgroundImage (ListStyle {})
gradient =
    Css.linearGradient2 Css.toTopRight (Css.stop primaryLight) (Css.stop primaryDark) []
