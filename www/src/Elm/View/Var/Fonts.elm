module View.Var.Fonts exposing (mono, sans)

import Css exposing (Style)


mono : Style
mono =
    Css.fontFamilies
        [ "Fira Mono"
        , "Menlo"
        , "Monaco"
        , "Consolas"
        , "Liberation Mono"
        , "Courier New"
        , "monospace"
        ]


sans : Style
sans =
    Css.fontFamilies
        [ "Fira Sans"
        , "system-ui"
        , "BlinkMacSystemFont"
        , "-apple-system"
        , "Segoe UI"
        , "Roboto"
        , "Oxygen"
        , "Ubuntu"
        , "Cantarell"
        , "Droid Sans"
        , "Helvetica Neue"
        , "sans-serif"
        ]
