module FileSystem.Options exposing (FileSystemState(..), Options(..), Output(..), Rest, compile, default)


type Options
    = Raw FileSystemState
    | Compiled FileSystemState


type alias Rest =
    { thePort : Bool
    , pathToElm : Bool
    , host : Bool
    , open : Bool
    , noRecover : Bool
    , pushstate : Bool
    , proxyHost : Bool
    , proxyPrefix : Bool
    , beforeBuild : Bool
    , afterBuild : Bool
    , debug : Bool
    }


type FileSystemState
    = FileSystemState Output Rest


type Output
    = Default
    | Build
    | CustomBuild
    | BuildDir
    | CustomBuildDir


compile : Options -> Options
compile options =
    case options of
        Raw flags ->
            Compiled flags

        Compiled flags ->
            Compiled flags


default : Options
default =
    Raw (FileSystemState Default empty)


empty : Rest
empty =
    { thePort = False
    , pathToElm = False
    , host = False
    , open = False
    , noRecover = False
    , pushstate = False
    , proxyHost = False
    , proxyPrefix = False
    , beforeBuild = False
    , afterBuild = False
    , debug = False
    }
