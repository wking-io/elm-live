module Options.Output exposing
    ( Output
    , decoder
    , fromString
    , toCommand
    , toNode
    )

import Command exposing (Command)
import FileSystem exposing (FileSystem, Node)
import Json.Decode as Decode exposing (Decoder)


type Output
    = OutputHtml
    | OutputJs
    | CustomHtml
    | CustomJs
    | DirHtml
    | DirJs
    | DirJsRoot
    | CustomDirHtml
    | CustomDirJs
    | CustomDirJsRoot



-- CONVERSIONS


fromString : String -> Output
fromString str =
    case str of
        "OutputHtml" ->
            OutputHtml

        "OutputJs" ->
            OutputJs

        "CustomHtml" ->
            CustomHtml

        "CustomJs" ->
            CustomJs

        "DirHtml" ->
            DirHtml

        "DirJs" ->
            DirJs

        "DirJsRoot" ->
            DirJsRoot

        "CustomDirHtml" ->
            CustomDirHtml

        "CustomDirJs" ->
            CustomDirJs

        "CustomDirJsRoot" ->
            CustomDirJsRoot

        _ ->
            OutputHtml


toNode : String -> Output -> List Node
toNode parent output =
    case output of
        OutputHtml ->
            [ FileSystem.makeHtmlFile parent "index"
            ]

        OutputJs ->
            [ FileSystem.makeJsFile parent "elm"
            , FileSystem.makeHtmlFile parent "index"
            ]

        CustomHtml ->
            [ FileSystem.makeHtmlFile parent "custom"
            ]

        CustomJs ->
            [ FileSystem.makeHtmlFile parent "custom"
            , FileSystem.makeJsFile parent "elm"
            ]

        DirHtml ->
            [ FileSystem.makeFolder parent
                "build"
                [ FileSystem.makeHtmlFile parent "index"
                ]
            ]

        DirJs ->
            [ FileSystem.makeFolder parent
                "build"
                [ FileSystem.makeJsFile parent "elm"
                , FileSystem.makeHtmlFile parent "index"
                ]
            ]

        DirJsRoot ->
            [ FileSystem.makeFolder parent
                "build"
                [ FileSystem.makeHtmlFile parent "index"
                ]
            , FileSystem.makeJsFile parent "elm"
            ]

        CustomDirHtml ->
            [ FileSystem.makeFolder parent
                "build"
                [ FileSystem.makeHtmlFile parent "custom"
                ]
            ]

        CustomDirJs ->
            [ FileSystem.makeFolder parent
                "build"
                [ FileSystem.makeHtmlFile parent "custom"
                , FileSystem.makeJsFile parent "elm"
                ]
            ]

        CustomDirJsRoot ->
            [ FileSystem.makeFolder parent
                "build"
                [ FileSystem.makeHtmlFile parent "custom"
                ]
            , FileSystem.makeJsFile parent "elm"
            ]


toCommand : Output -> Command -> Command
toCommand output cmd =
    case output of
        OutputHtml ->
            cmd

        OutputJs ->
            Command.addElmFlag "--output=index.html" cmd

        CustomHtml ->
            cmd
                |> Command.addLiveFlag "--start-page=custom.html"
                |> Command.addElmFlag "--output=custom.html"

        CustomJs ->
            cmd
                |> Command.addLiveFlag "--start-page=custom.html"
                |> Command.addElmFlag "--output=elm.js"

        DirHtml ->
            cmd
                |> Command.addLiveFlag "--dir=build"
                |> Command.addElmFlag "--output=build/index.html"

        DirJs ->
            cmd
                |> Command.addLiveFlag "--dir=build"
                |> Command.addElmFlag "--output=build/elm.js"

        DirJsRoot ->
            cmd
                |> Command.addLiveFlag "--dir=build"
                |> Command.addElmFlag "--output=elm.js"

        CustomDirHtml ->
            cmd
                |> Command.addLiveFlag "--dir=build"
                |> Command.addLiveFlag "--start-page=custom.html"
                |> Command.addElmFlag "--output=build/custom.html"

        CustomDirJs ->
            cmd
                |> Command.addLiveFlag "--dir=build"
                |> Command.addLiveFlag "--start-page=custom.html"
                |> Command.addElmFlag "--output=build/elm.js"

        CustomDirJsRoot ->
            cmd
                |> Command.addLiveFlag "--dir=build"
                |> Command.addLiveFlag "--start-page=custom.html"
                |> Command.addElmFlag "--output=elm.js"



-- DECODER


decoder : Decoder Output
decoder =
    Decode.map fromString Decode.string
