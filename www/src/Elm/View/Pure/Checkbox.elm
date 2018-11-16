module View.Pure.Checkbox exposing (view)

import Css
import Html.Styled as Html exposing (Attribute, Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)
import View.Var.Colors as Colors
import View.Var.Fonts as Fonts


type alias Config msg =
    { id : String
    , msg : msg
    , name : String
    }


view : Config msg -> Html msg
view { msg, name, id } =
    Html.styled Html.div
        []
        []
        [ checkboxLabel [ HA.for id, onClick msg ] [ Html.text name ]
        , checkboxInput [ HA.id id, HA.type_ "checkbox", onClick msg ] []
        ]


checkboxInput : List (Attribute msg) -> List (Html msg) -> Html msg
checkboxInput =
    Html.styled Html.input
        [ Css.position Css.absolute
        , Css.left (Css.px -9999)
        ]


checkboxLabel : List (Attribute msg) -> List (Html msg) -> Html msg
checkboxLabel =
    Html.styled Html.label
        [ Css.padding2 (Css.rem 2) (Css.rem 3)
        , Css.border3 (Css.rem 0.5) Css.solid Colors.black
        , Css.borderRadius (Css.rem 0.5)
        , Css.backgroundImage Colors.gradient
        , Css.backgroundPosition2 (Css.px -6) (Css.px 6)
        , Css.backgroundRepeat Css.noRepeat
        , Fonts.mono
        , Css.margin2 (Css.rem 1) (Css.rem 1)
        , Css.display Css.block
        , Css.textAlign Css.center
        ]
