module View.FileSystem exposing (contents, files)

import FileSystem exposing (FileSystem(..), Focus(..))
import FileSystem.File.Extension as Extension
import FileSystem.Folder exposing (Visibility(..))
import FileSystem.Id as Id exposing (Id)
import FileSystem.Node as Node exposing (Node(..))
import Html.Styled as Html exposing (Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)
import View.File exposing (viewContent, viewItem)


view : FileSystem -> Html msg
view (FileSystem node) =
    Html.div []
        [ case node of
            Folder { id, name, visibility } children ->
                let
                    childrenHtml =
                        List.concatMap (filesHelp focus fileMsg folderMsg) children
                in
                case visibility of
                    Open ->
                        [ Html.button
                            [ HA.attribute "aria-expanded" "true"
                            , HA.attribute "aria-controls" (Id.toString id)
                            , onClick (folderMsg id)
                            ]
                            [ Html.text name ]
                        , Html.div [ HA.id (Id.toString id) ] childrenHtml
                        ]

                    Closed ->
                        [ Html.button
                            [ HA.attribute "aria-expanded" "false"
                            , HA.attribute "aria-controls" (Id.toString id)
                            , onClick (folderMsg id)
                            ]
                            [ Html.text name ]
                        , Html.div [ HA.id (Id.toString id), HA.hidden True ] childrenHtml
                        ]

            File data ->
                [ viewItem focus data fileMsg ]
        ]
