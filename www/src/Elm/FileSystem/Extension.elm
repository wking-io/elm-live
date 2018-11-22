module FileSystem.Extension exposing (Extension(..), toExtension, toString)


type Extension
    = Css
    | Elm
    | Html
    | Js
    | Json


toString : Extension -> String
toString extension =
    case extension of
        Js ->
            "js"

        Json ->
            "json"

        Elm ->
            "elm"

        Css ->
            "css"

        Html ->
            "html"


toExtension : Extension -> String
toExtension ext =
    "." ++ toString ext
