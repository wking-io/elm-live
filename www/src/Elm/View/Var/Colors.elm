module View.Var.Colors exposing
    ( gradient
    , primary
    , primaryDark
    , primaryLight
    , secondary
    , secondaryDark
    , secondaryDarker
    , secondaryDarkest
    , secondaryLight
    , secondaryLighter
    , secondaryLightest
    , white
    )

import Css exposing (BackgroundImage, Color, ListStyle)


secondaryDarkest : Color
secondaryDarkest =
    Css.rgb 30 32 43


secondaryDarker : Color
secondaryDarker =
    Css.rgb 26 53 71


secondaryDark : Color
secondaryDark =
    Css.rgb 55 83 99


secondary : Color
secondary =
    Css.rgb 77 116 137


secondaryLight : Color
secondaryLight =
    Css.rgb 153 177 188


secondaryLighter : Color
secondaryLighter =
    Css.rgb 211 222 226


secondaryLightest : Color
secondaryLightest =
    Css.rgb 243 244 245


primary : Color
primary =
    Css.rgb 247 127 0


primaryDark : Color
primaryDark =
    Css.rgb 239 99 0


primaryLight : Color
primaryLight =
    Css.rgb 255 160 28


white : Color
white =
    Css.rgb 255 255 255


gradient : BackgroundImage (ListStyle {})
gradient =
    Css.linearGradient2 Css.toTopRight (Css.stop primaryLight) (Css.stop primaryDark) []
