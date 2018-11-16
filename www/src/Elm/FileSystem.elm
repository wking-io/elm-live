module FileSystem exposing
    ( FileSystem(..)
    , Focus(..)
    , compile
    , default
    , fromOptions
    , toggleFolder
    , updateFocus
    )

import FileSystem.File as File
import FileSystem.File.Content as Content
import FileSystem.Id as Id exposing (Id)
import FileSystem.Node as Node exposing (Node)
import FileSystem.Options as Options exposing (Compiled, FileSystemState(..), Options, Output(..), Raw)


type FileSystem
    = FileSystem Focus Node


type Focus
    = None
    | Focus File.Data


toggleFolder : Id -> FileSystem -> FileSystem
toggleFolder id ((FileSystem focus node) as filesystem) =
    Node.toggleFolder id node
        |> FileSystem focus


updateFocus : Id -> FileSystem -> FileSystem
updateFocus newId ((FileSystem focus node) as filesystem) =
    case focus of
        None ->
            FileSystem (findFocus newId node) node

        Focus { id } ->
            if Id.equal newId id then
                filesystem

            else
                FileSystem (findFocus newId node) node


findFocus : Id -> Node -> Focus
findFocus id node =
    case Node.find id node of
        Ok data ->
            let
                _ =
                    Debug.log "File found with id of:" data.id
            in
            Focus data

        Err _ ->
            let
                _ =
                    Debug.log "No file found with id of:" id
            in
            None


outputNode : String -> FileSystemState -> List Node
outputNode parent (FileSystemState flags _) =
    case flags of
        Default ->
            [ Node.makeHtmlFile parent "index" "Compiled Elm Here" ]

        Build ->
            [ Node.makeJsFile parent "elm" "Compiled Elm Here"
            , Node.makeHtmlFile parent "index" Content.htmlMain
            ]

        CustomBuild ->
            [ Node.makeHtmlFile parent "custom" Content.htmlMain
            , Node.makeJsFile parent "elm" "Compiled Elm Here"
            ]

        BuildDir ->
            [ Node.makeClosedFolder parent
                "build"
                [ Node.makeJsFile parent "elm" "Compiled Elm Here"
                , Node.makeHtmlFile parent "index" Content.htmlMain
                ]
            ]

        CustomBuildDir ->
            [ Node.makeClosedFolder parent
                "build"
                [ Node.makeHtmlFile parent "custom" Content.htmlMain
                , Node.makeJsFile parent "elm" "Compiled Elm Here"
                ]
            ]


generate : String -> Options a -> List Node
generate parent options =
    case options of
        Raw flags ->
            [ Node.makeClosedFolder parent "src" [ Node.makeElmFile parent "Main" Content.elmMain ]
            , Node.makeJsonFile parent "elm" Content.elmJson
            , Node.makeCssFile parent "style" Content.styleCss
            , Node.makeJsonFile parent "package" Content.packageJson
            ]

        Compiled flags ->
            outputNode parent flags
                ++ [ Node.makeClosedFolder parent "src" [ Node.makeElmFile parent "Main" Content.elmMain ]
                   , Node.makeJsonFile parent "elm" Content.elmJson
                   , Node.makeCssFile parent "style" Content.styleCss
                   , Node.makeJsonFile parent "package" Content.packageJson
                   ]


fromOptions : Options -> FileSystem
fromOptions options =
    options
        |> generate "my-project"
        |> List.sortBy Node.sort
        |> Node.makeOpenFolder "root" "my-project"
        |> FileSystem None


default : FileSystem
default =
    fromOptions Options.default


compile : Options -> FileSystem
compile options =
    Options.compile options
        |> fromOptions
