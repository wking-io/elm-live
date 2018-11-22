module Options exposing
    ( Options
    , compile
    , decoder
    , uncompile
    , view
    )

import Command exposing (Command)
import FileSystem exposing (FileSystem, Node)
import Html.Styled as Html exposing (Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)
import Json.Decode as Decode exposing (Decoder)
import Options.Flag as Flag exposing (Flag)
import Options.Output as Output exposing (Output)


type Options
    = Raw Output (List Flag)
    | Compiled Output (List Flag)


decoder : Decoder Options
decoder =
    Decode.map2 Raw
        (Decode.field "output" Output.decoder)
        (Decode.field "flags" Flag.decoder)



-- FILESYSTEM


compile : Options -> Options
compile options =
    case options of
        Raw output flags ->
            Compiled output flags

        Compiled output flags ->
            Compiled output flags


uncompile : Options -> Options
uncompile options =
    case options of
        Raw output flags ->
            Raw output flags

        Compiled output flags ->
            Raw output flags


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
        Raw output flags ->
            [ FileSystem.makeFolder parent "src" [ FileSystem.makeElmFile parent "Main" ]
            , FileSystem.makeJsonFile parent "elm"
            , FileSystem.makeCssFile parent "style"
            , FileSystem.makeJsonFile parent "package"
            ]

        Compiled output flags ->
            Output.toNode parent output
                ++ [ FileSystem.makeFolder parent "src" [ FileSystem.makeElmFile parent "Main" ]
                   , FileSystem.makeJsonFile parent "elm"
                   , FileSystem.makeCssFile parent "style"
                   , FileSystem.makeJsonFile parent "package"
                   ]



-- COMMAND


toCommand : Options -> Command
toCommand options =
    case options of
        Raw output flags ->
            Command.empty
                |> Output.toCommand output
                |> flagsToCommand flags

        Compiled output flags ->
            Command.empty
                |> Output.toCommand output
                |> flagsToCommand flags


flagsToCommand : List Flag -> Command -> Command
flagsToCommand flags cmd =
    List.foldl Flag.toCommand cmd flags



-- VIEW


type alias ViewConfig msg =
    { uncompileMsg : msg
    , compileMsg : msg
    , options : Options
    , files : FileSystem -> Html msg
    }


view : ViewConfig msg -> Html msg
view { uncompileMsg, compileMsg, options, files } =
    case options of
        Raw _ _ ->
            Html.div []
                [ Html.div
                    [ HA.attribute "role" "tablist"
                    , HA.attribute "aria-label" "File Preview"
                    ]
                    [ Html.button
                        [ HA.attribute "role" "tab"
                        , HA.attribute "aria-selected" "true"
                        , HA.attribute "aria-controls" "raw-tab"
                        , HA.id "raw"
                        , onClick uncompileMsg
                        ]
                        [ Html.text "Raw" ]
                    , Html.button
                        [ HA.attribute "role" "tab"
                        , HA.attribute "aria-selected" "true"
                        , HA.attribute "aria-controls" "compiled-tab"
                        , HA.id "compiled"
                        , HA.tabindex -1
                        , onClick compileMsg
                        ]
                        [ Html.text "Compiled" ]
                    ]
                , Html.div
                    [ HA.tabindex 0
                    , HA.attribute "role" "tabpanel"
                    , HA.id "raw-tab"
                    , HA.attribute "aria-labellby" "raw"
                    ]
                    [ files (toFileSystem options) ]
                , Html.div
                    [ HA.tabindex 0
                    , HA.attribute "role" "tabpanel"
                    , HA.id "compile-tab"
                    , HA.attribute "aria-labellby" "compile"
                    , HA.hidden True
                    ]
                    []
                ]

        Compiled _ _ ->
            Html.div []
                [ Html.div
                    [ HA.attribute "role" "tablist"
                    , HA.attribute "aria-label" "File Preview"
                    ]
                    [ Html.button
                        [ HA.attribute "role" "tab"
                        , HA.attribute "aria-selected" "true"
                        , HA.attribute "aria-controls" "raw-tab"
                        , HA.id "raw"
                        , onClick uncompileMsg
                        ]
                        [ Html.text "Raw" ]
                    , Html.button
                        [ HA.attribute "role" "tab"
                        , HA.attribute "aria-selected" "true"
                        , HA.attribute "aria-controls" "compiled-tab"
                        , HA.id "compiled"
                        , HA.tabindex -1
                        , onClick compileMsg
                        ]
                        [ Html.text "Compiled" ]
                    ]
                , Html.div
                    [ HA.tabindex 0
                    , HA.attribute "role" "tabpanel"
                    , HA.id "raw-tab"
                    , HA.attribute "aria-labellby" "raw"
                    , HA.hidden True
                    ]
                    []
                , Html.div
                    [ HA.tabindex 0
                    , HA.attribute "role" "tabpanel"
                    , HA.id "compile-tab"
                    , HA.attribute "aria-labellby" "compile"
                    ]
                    [ files (toFileSystem options) ]
                ]
