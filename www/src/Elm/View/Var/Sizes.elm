module View.Var.Sizes exposing (screen)

import Css


screen : { sm : Css.Rem, md : Css.Rem, lg : Css.Rem, xl : Css.Rem }
screen =
    { sm = Css.rem 144
    , md = Css.rem 192
    , lg = Css.rem 248
    , xl = Css.rem 300
    }
