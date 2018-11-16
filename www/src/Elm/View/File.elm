module View.File exposing (viewContent, viewItem)

import FileSystem exposing (Focus(..))
import FileSystem.File as File
import FileSystem.File.Extension as Extension
import FileSystem.Id as Id exposing (Id)
import Html.Styled as Html exposing (Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)


viewItem : Focus -> File.Data -> (Id -> msg) -> Html msg
viewItem focus { id, name, extension } msg =
    let
        focusAttr =
            case focus of
                None ->
                    HA.attribute "aria-selected" "false"

                Focus data ->
                    if Id.equal data.id id then
                        HA.attribute "aria-selected" "true"

                    else
                        HA.attribute "aria-selected" "false"
    in
    Html.button
        [ HA.id (Id.toString id ++ "-tab")
        , HA.attribute "role" "tab"
        , HA.attribute "aria-controls" (Id.toString id)
        , focusAttr
        , onClick (msg id)
        ]
        [ Html.text (name ++ Extension.toExtension extension) ]


viewContent : Bool -> File.Data -> Html msg
viewContent isHidden { id, contents } =
    Html.div
        [ HA.attribute "role" "tabpanel"
        , HA.attribute "aria-labelledby" (Id.toString id ++ "-tab")
        , HA.id (Id.toString id)
        , HA.hidden (not isHidden)
        ]
        [ Html.text contents ]
