module FileSystem exposing
    ( FileData
    , FileSystem(..)
    , FolderData
    , Node
    , fromNode
    , makeCssFile
    , makeElmFile
    , makeFolder
    , makeHtmlFile
    , makeJsFile
    , makeJsonFile
    , sort
    , view
    )

import Css
import FileSystem.Extension as Extension exposing (Extension(..))
import FileSystem.Id as Id exposing (Id)
import Html.Styled as Html exposing (Attribute, Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)
import Icon exposing (Icon)


type FileSystem
    = FileSystem Node


type Node
    = Folder FolderData (List Node)
    | File FileData


type alias FolderData =
    { id : Id
    , name : String
    }


type alias FileData =
    { id : Id
    , extension : Extension
    , name : String
    }


sort : Node -> String
sort node =
    case node of
        Folder { name } _ ->
            "a" ++ name

        File { name } ->
            "b" ++ name


makeFile : Extension -> String -> String -> Node
makeFile extension parent name =
    File
        { id = Id.generate (parent ++ name ++ Extension.toString extension)
        , extension = extension
        , name = name
        }


makeJsFile : String -> String -> Node
makeJsFile =
    makeFile Js


makeJsonFile : String -> String -> Node
makeJsonFile =
    makeFile Json


makeElmFile : String -> String -> Node
makeElmFile =
    makeFile Elm


makeCssFile : String -> String -> Node
makeCssFile =
    makeFile Css


makeHtmlFile : String -> String -> Node
makeHtmlFile =
    makeFile Html


makeFolder : String -> String -> List Node -> Node
makeFolder parent name children =
    Folder { id = Id.generate (parent ++ name), name = name } children


fromNode : Node -> FileSystem
fromNode =
    FileSystem



-- VIEW


view : FileSystem -> Html msg
view (FileSystem node) =
    case node of
        Folder data children ->
            Html.div []
                [ viewFolder data
                , List.concatMap viewHelp children
                    |> Html.div [ HA.id (Id.toString data.id) ]
                ]

        File data ->
            Html.div [] [ viewFile data ]


viewHelp : Node -> List (Html msg)
viewHelp node =
    case node of
        Folder data children ->
            [ viewFolder data
            , List.concatMap viewHelp children
                |> Html.div [ HA.id (Id.toString data.id) ]
            ]

        File data ->
            [ viewFile data ]


viewFolder : FolderData -> Html msg
viewFolder { id, name } =
    viewNode Icon.folder name


viewFile : FileData -> Html msg
viewFile { id, name, extension } =
    viewNode Icon.file (name ++ Extension.toExtension extension)


viewNode : Icon msg -> String -> Html msg
viewNode icon name =
    Html.div []
        [ viewIcon [] [ Icon.toHtml icon ]
        , Html.p [] [ Html.text name ]
        ]


viewIcon : List (Attribute msg) -> List (Html msg) -> Html msg
viewIcon =
    Html.styled Html.div
        [ Css.width (Css.px 20) ]
