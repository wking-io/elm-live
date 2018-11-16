module FileSystem.Options exposing (Flags(..), Options(..), Output(..), Rest, compile, default)


type Options a
    = Options Flags


type Raw
    = Raw


type Compiled
    = Compiled


type alias Rest =
    { port_ : Bool
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


type Flags
    = Flags Output Rest


type Output
    = Default
    | Build
    | CustomBuild
    | BuildDir
    | CustomBuildDir


compile : Options Raw -> Options Compiled
compile options =
    options


default : Options Raw
default =
    Options (Flags Default empty)


empty : Rest
empty =
    { port_ = False
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
