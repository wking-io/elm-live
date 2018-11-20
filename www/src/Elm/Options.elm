module Options exposing (Options, decoder)

import Command exposing (Command)
import FileSystem exposing (FileSystem, Node)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (required)


type Options
    = Raw Flags
    | Compiled Flags


type Flags
    = Flags Output (List OtherFlag)


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


type FlagType
    = LiveFlag
    | ElmFlag


type OtherFlag
    = Port
    | PathToElm
    | Host
    | Open
    | NoRecover
    | Pushstate
    | ProxyHost
    | ProxyPrefix
    | BeforeBuild
    | AfterBuild
    | Debug


getFlagType : OtherFlag -> FlagType
getFlagType flag =
    case flag of
        Debug ->
            ElmFlag

        _ ->
            LiveFlag


flagToString : OtherFlag -> String
flagToString flag =
    case flag of
        Port ->
            "--port=1234"

        PathToElm ->
            "--pathToElm=node_modules/.bin/elm"

        Host ->
            "--host=elm-live.test"

        Open ->
            "--open"

        NoRecover ->
            "--no-recover"

        Pushstate ->
            "--pushstate"

        ProxyHost ->
            "--proxy-host=http://localhost:9000"

        ProxyPrefix ->
            "--proxy-prefix=/api"

        BeforeBuild ->
            "--before-build=\"elm test\""

        AfterBuild ->
            "--after-build=\"npm run after\""

        Debug ->
            "--debug"


decoder : Decode.Value -> Options
decoder json =
    Raw (Flags OutputHtml [])



-- FILESYSTEM


compile : Options -> Options
compile options =
    case options of
        Raw flags ->
            Compiled flags

        Compiled flags ->
            Compiled flags


toFileSystem : Options -> FileSystem
toFileSystem options =
    options
        |> generate "my-project"
        |> List.sortBy FileSystem.sort
        |> FileSystem.makeFolder "root" "my-project"
        |> FileSystem.fromNode


generate : String -> Options -> List Node
generate parent options =
    case options of
        Raw flags ->
            [ FileSystem.makeFolder parent "src" [ FileSystem.makeElmFile parent "Main" ]
            , FileSystem.makeJsonFile parent "elm"
            , FileSystem.makeCssFile parent "style"
            , FileSystem.makeJsonFile parent "package"
            ]

        Compiled flags ->
            outputNode parent flags
                ++ [ FileSystem.makeFolder parent "src" [ FileSystem.makeElmFile parent "Main" ]
                   , FileSystem.makeJsonFile parent "elm"
                   , FileSystem.makeCssFile parent "style"
                   , FileSystem.makeJsonFile parent "package"
                   ]


outputNode : String -> Flags -> List Node
outputNode parent (Flags output _) =
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



-- COMMAND


toCommand : Options -> Command
toCommand options =
    case options of
        Raw (Flags output flags) ->
            Command.empty
                |> outputTransform output
                |> otherFlagsTransform flags

        Compiled (Flags output flags) ->
            Command.empty
                |> outputTransform output
                |> otherFlagsTransform flags


otherFlagsTransform : List OtherFlag -> Command -> Command
otherFlagsTransform flags cmd =
    List.foldl otherFlagTransformHelp cmd flags


otherFlagTransformHelp : OtherFlag -> Command -> Command
otherFlagTransformHelp flag cmd =
    case getFlagType flag of
        LiveFlag ->
            Command.addLiveFlag (flagToString flag) cmd

        ElmFlag ->
            Command.addElmFlag (flagToString flag) cmd


outputTransform : Output -> Command -> Command
outputTransform output cmd =
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
