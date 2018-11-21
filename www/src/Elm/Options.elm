module Options exposing (Options, decoder)

import Command exposing (Command)
import FileSystem exposing (FileSystem, Node)
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
