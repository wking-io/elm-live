module View.Options exposing (view)

import Css
import FileSystem.Flag as Flag exposing (Flag(..))
import Html.Styled as Html exposing (Attribute, Html)
import Html.Styled.Attributes as HA


view : (Flag -> msg) -> Html msg
view msg =
    Html.styled Html.div
        [ Css.displayFlex
        , Css.flexDirection Css.row
        , Css.flexWrap Css.wrap
        ]
        []
        [ Flag.toHtml msg Port
        , Flag.toHtml msg PathToElm
        , Flag.toHtml msg Host
        , Flag.toHtml msg Dir
        , Flag.toHtml msg StartPage
        , Flag.toHtml msg Open
        , Flag.toHtml msg NoRecover
        , Flag.toHtml msg Pushstate
        , Flag.toHtml msg ProxyHost
        , Flag.toHtml msg ProxyPrefix
        , Flag.toHtml msg BeforeBuild
        , Flag.toHtml msg AfterBuild
        , Flag.toHtml msg Debug
        , Flag.toHtml msg Output
        ]
