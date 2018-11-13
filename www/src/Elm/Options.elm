module Options exposing (Options, decoder)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as Pipeline exposing (required)
import Output exposing (Output)

type alias Options =
    { port_ : Bool
    , pathToElm : Bool
    , host : Bool
    , dir : Bool
    , startPage : Bool
    , open : Bool
    , noRecover : Bool
    , pushstate : Bool
    , proxyHost : Bool
    , proxyPrefix : Bool
    , beforeBuild : Bool
    , afterBuild : Bool
    , debug : Bool
    , output : Output
    }

decoder : Decoder Options
decoder =
  Decode.succeed Options
    |> required "port" Decode.bool
    |> required "pathToElm" Decode.bool
    |> required "host" Decode.bool
    |> required "dir" Decode.bool
    |> required "startPage" Decode.bool
    |> required "open" Decode.bool
    |> required "noRecover" Decode.bool
    |> required "pushstate" Decode.bool
    |> required "proxyHost" Decode.bool
    |> required "proxyPrefix" Decode.bool
    |> required "beforeBuild" Decode.bool
    |> required "afterBuild" Decode.bool
    |> required "debug" Decode.bool
    |> required "output" Output.decoder
