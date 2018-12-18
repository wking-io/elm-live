module Options exposing
    ( Options
    , compile
    , decoder
    , uncompile
    , viewCommand
    , viewFiles
    )

import Command exposing (Command)
import Css
import Css.Media as Media exposing (withMedia)
import FileSystem exposing (FileSystem, Node)
import Html.Styled as Html exposing (Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)
import Json.Decode as Decode exposing (Decoder)
import Options.Flag as Flag exposing (Flag)
import Options.Output as Output exposing (Output)
import View.Var.Colors as Colors
import View.Var.Sizes as Sizes exposing (screen)


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


boolToString : Bool -> String
boolToString bool =
    if bool then
        "true"

    else
        "false"


type alias ViewConfig msg =
    { uncompileMsg : msg
    , compileMsg : msg
    , options : Options
    , files : FileSystem -> Html msg
    , isOpen : Bool
    }


viewFiles : ViewConfig msg -> Html msg
viewFiles { uncompileMsg, compileMsg, options, files, isOpen } =
    case options of
        Raw _ _ ->
            FileSystem.wrapper isOpen
                [ HA.attribute "aria-hidden" <| boolToString <| not isOpen
                ]
                [ Html.div
                    [ HA.attribute "role" "tablist"
                    , HA.attribute "aria-label" "File Preview"
                    ]
                    [ FileSystem.firstTabActive
                        [ HA.attribute "role" "tab"
                        , HA.attribute "aria-selected" "true"
                        , HA.attribute "aria-controls" "raw-tab"
                        , HA.id "raw"
                        , onClick uncompileMsg
                        ]
                        [ Html.text "Raw Preview" ]
                    , FileSystem.lastTabInactive
                        [ HA.attribute "role" "tab"
                        , HA.attribute "aria-selected" ""
                        , HA.attribute "aria-controls" "compiled-tab"
                        , HA.id "compiled"
                        , HA.tabindex -1
                        , onClick compileMsg
                        ]
                        [ Html.text "Compiled Preview" ]
                    ]
                , FileSystem.spacer
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
            FileSystem.wrapper isOpen
                [ HA.attribute "aria-hidden" <| boolToString <| not isOpen
                ]
                [ Html.div
                    [ HA.attribute "role" "tablist"
                    , HA.attribute "aria-label" "File Preview"
                    ]
                    [ FileSystem.firstTabInactive
                        [ HA.attribute "role" "tab"
                        , HA.attribute "aria-selected" "false"
                        , HA.attribute "aria-controls" "raw-tab"
                        , HA.id "raw"
                        , onClick uncompileMsg
                        ]
                        [ Html.text "Raw Preview" ]
                    , FileSystem.lastTabActive
                        [ HA.attribute "role" "tab"
                        , HA.attribute "aria-selected" "true"
                        , HA.attribute "aria-controls" "compiled-tab"
                        , HA.id "compiled"
                        , HA.tabindex -1
                        , onClick compileMsg
                        ]
                        [ Html.text "Compiled Preview" ]
                    ]
                , Html.div
                    [ HA.tabindex 0
                    , HA.attribute "role" "tabpanel"
                    , HA.id "raw-tab"
                    , HA.attribute "aria-labellby" "raw"
                    , HA.hidden True
                    ]
                    []
                , FileSystem.spacer
                    [ HA.tabindex 0
                    , HA.attribute "role" "tabpanel"
                    , HA.id "compile-tab"
                    , HA.attribute "aria-labellby" "compile"
                    ]
                    [ files (toFileSystem options) ]
                ]


viewCommand : ( Options, Bool ) -> Html msg
viewCommand ( opts, isOpen ) =
    Html.styled Html.div
        [ Css.flex (Css.int 1)
        , Css.marginTop (Css.rem -0.25)
        , Css.backgroundColor Colors.white
        , withMedia [ Media.only Media.screen [ Media.minWidth screen.md ] ]
            [ Css.position Css.fixed
            , Css.left (Css.rem 0)
            , Css.bottom (Css.rem 0)
            , Css.width (Css.calc (Css.vw 100) Css.minus (Css.rem 100))
            ]
        ]
        [ HA.attribute "aria-hidden" <| boolToString <| not isOpen
        ]
        [ Html.styled Html.pre
            [ Css.borderTop3 (Css.rem 0.25) Css.solid Colors.secondaryDarkest
            , Css.borderBottom3 (Css.rem 0.25) Css.solid Colors.secondaryDarkest
            , Css.padding (Css.rem 5)
            , Css.margin (Css.rem 0)
            , Css.lineHeight (Css.pct 120)
            ]
            []
            [ Html.text "elm-live src/Main.elm" ]
        ]
