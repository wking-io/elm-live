module View.Var.Sizes exposing (screen)

import Css


screen : { sm : Css.Px, md : Css.Px, lg : Css.Px, xl : Css.Px }
screen =
    { sm = Css.px 576
    , md = Css.px 768
    , lg = Css.px 992
    , xl = Css.px 1200
    }
