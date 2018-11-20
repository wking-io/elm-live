module FileSystem exposing
    ( FileSystem
    , Node
    , fromNode
    , makeCssFile
    , makeElmFile
    , makeFolder
    , makeHtmlFile
    , makeJsFile
    , makeJsonFile
    , sort
    )

import FileSystem.Extension as Extension exposing (Extension(..))
import FileSystem.Id as Id exposing (Id)
import Html.Styled as Html exposing (Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)


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
    Html.div [ HA.attribute "role" "tablist", HA.attribute "aria-label" "FileSystem Preview" ] (filesHelp node)


filesHelp : Node -> List (Html msg)
filesHelp node =
    case node of
        Folder { id, name } children ->
            let
                childrenHtml =
                    List.concatMap filesHelp children
            in
            [ Html.div
                []
                [ Html.text name ]
            , List.concatMap filesHelp children |> Html.div []
            ]

        File { name, extension } ->
            [ Html.div
                []
                [ Html.text (name ++ Extension.toExtension extension) ]
            ]
