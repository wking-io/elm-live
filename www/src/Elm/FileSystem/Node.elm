module FileSystem.Node exposing
  (Node(..)
, find, makeClosedFolder, makeCssFile, makeElmFile, makeHtmlFile, makeJsFile, makeJsonFile, makeOpenFolder, sort, toggleFolder)

import FileSystem.File as File
import FileSystem.File.Extension as Extension exposing (Extension(..))
import FileSystem.Folder as Folder
import FileSystem.Id as Id exposing (Id)


type Node    = Folder Folder.Data (List Node)
    | File File.Data


sort : Node -> String
sort node =
    case node of
        Folder { name } nodes ->
            "a" ++ name

        File { name } ->
            "b" ++ name


getFiles : Node -> List File.Data
getFiles node =
    case node of
        Folder _ nodes ->
            List.concatMap getFiles nodes

        File data ->
            [ data ]


find : Id -> Node -> Result Id File.Data
find id node =
    node
        |> getFiles
        |> findFile id


findFile : Id -> List File.Data -> Result Id File.Data
findFile id files =
    case files of
        [] ->
            Err id

        first :: rest ->
            if Id.equal first.id id then
                Ok first

            else
                findFile id rest


toggleFolder : Id -> Node -> Node
toggleFolder id node =
    case node of
        Folder data children ->
            if Id.equal id data.id then
                Folder { data | visibility = Folder.toggle data.visibility } children

            else
                List.map (toggleFolder id) children
                    |> Folder data

        File data ->
            File data


makeFile : Extension -> String -> String -> String -> Node
makeFile extension parent name contents =
    File
        { id = Id.generate (parent ++ name ++ Extension.toString extension)
        , extension = extension
        , name = name
        , contents = contents
        }


makeJsFile : String -> String -> String -> Node
makeJsFile =
    makeFile Js


makeJsonFile : String -> String -> String -> Node
makeJsonFile =
    makeFile Json


makeElmFile : String -> String -> String -> Node
makeElmFile =
    makeFile Elm


makeCssFile : String -> String -> String -> Node
makeCssFile =
    makeFile Css


makeHtmlFile : String -> String -> String -> Node
makeHtmlFile =
    makeFile Html


makeFolder : Folder.Visibility -> String -> String -> List Node -> Node
makeFolder visibility parent name children =
    Folder { id = Id.generate (parent ++ name), visibility = visibility, name = name } children


makeOpenFolder : String -> String -> List Node -> Node
makeOpenFolder =
    Folder.mapOpen makeFolder


makeClosedFolder : String -> String -> List Node -> Node
makeClosedFolder =
    Folder.mapClosed makeFolder
