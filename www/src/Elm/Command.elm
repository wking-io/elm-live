module Command exposing (Command, addElmFlag, addLiveFlag, empty, toString, view)

import Css
import Css.Media as Media exposing (withMedia)
import Html.Styled as Html exposing (Html)
import Html.Styled.Attributes as HA
import View.Var.Colors as Colors
import View.Var.Sizes as Sizes exposing (screen)


type Command
    = Command (List String) (List String)


addLiveFlag : String -> Command -> Command
addLiveFlag flag (Command liveArgs elmArgs) =
    Command (liveArgs ++ [ flag ]) elmArgs


addElmFlag : String -> Command -> Command
addElmFlag flag (Command liveArgs elmArgs) =
    Command liveArgs (elmArgs ++ [ flag ])


toString : Command -> String
toString (Command liveFlags makeFlags) =
    if List.isEmpty makeFlags then
        "elm-live src/Main.elm " ++ String.join " " liveFlags

    else
        "elm-live src/Main.elm " ++ String.join " " liveFlags ++ " -- " ++ String.join " " makeFlags


empty : Command
empty =
    Command [] []


view : Command -> Html msg
view cmd =
    Html.styled Html.pre
        [ Css.borderTop3 (Css.rem 0.25) Css.solid Colors.secondaryDarkest
        , Css.borderBottom3 (Css.rem 0.25) Css.solid Colors.secondaryDarkest
        , Css.padding (Css.rem 5)
        , Css.margin (Css.rem 0)
        , Css.lineHeight (Css.pct 125)
        , Css.overflow Css.auto
        ]
        []
        [ Html.text <| toString cmd ]
