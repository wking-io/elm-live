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
                [ Html.button
                    [ HA.attribute "aria-expanded" "true"
                    , HA.attribute "aria-controls" (Id.toString id)
                    , onClick (folderMsg id)
                    ]
                    [ Html.text name ]
                , Html.div [ HA.id (Id.toString id) ] childrenHtml
                ]

            File data ->
                [ viewItem focus data fileMsg ]
        ]


viewHelp : Node -> Html msg
viewHelp node =
    case node of
        Folder data children ->
            [ viewFolder data
            , List.concatMap viewHelp children
                |> Html.div [ HA.id (Id.toString id) ]
            ]

        File data ->
            [ viewFile data ]


viewFolder : FolderData -> Html msg
viewFolder { id, name } =
    viewNode Icon.folder name


viewFile : FileData -> Html msg
viewFile { id, name, extension } =
    viewNode (Icon.fromExtension extension) (name ++ Extension.toExtension extension)


viewNode : Icon -> String -> Html msg
viewNode icon name =
    Html.div []
        [ Icon.toHtml icon
        , Html.p [] [ Html.text name ]
        ]
