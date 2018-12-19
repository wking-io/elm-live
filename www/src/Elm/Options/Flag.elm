module Options.Flag exposing
    ( Flag
    , decoder
    , fromString
    , getType
    , toCommand
    , toString
    )

import Command exposing (Command)
import Json.Decode as Decode exposing (Decoder)


type Flag
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


type FlagType
    = LiveFlag
    | ElmFlag



-- CONVERSIONS


getType : Flag -> FlagType
getType flag =
    case flag of
        Debug ->
            ElmFlag

        _ ->
            LiveFlag


fromString : String -> Flag
fromString str =
    case str of
        "port" ->
            Port

        "pathToElm" ->
            PathToElm

        "host" ->
            Host

        "open" ->
            Open

        "noRecover" ->
            NoRecover

        "pushState" ->
            Pushstate

        "proxyHost" ->
            ProxyHost

        "proxyPrefix" ->
            ProxyPrefix

        "beforeBuild" ->
            BeforeBuild

        "afterBuild" ->
            AfterBuild

        "debug" ->
            Debug

        _ ->
            Port


toString : Flag -> String
toString flag =
    case flag of
        Port ->
            "--port=1234"

        PathToElm ->
            "--path-to-elm=node_modules/.bin/elm"

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


toCommand : Flag -> Command -> Command
toCommand flag cmd =
    case getType flag of
        LiveFlag ->
            Command.addLiveFlag (toString flag) cmd

        ElmFlag ->
            Command.addElmFlag (toString flag) cmd



-- DECODER


decoder : Decoder (List Flag)
decoder =
    Decode.keyValuePairs Decode.bool
        |> Decode.map (List.foldl flagReducer [])


flagReducer : ( String, Bool ) -> List Flag -> List Flag
flagReducer ( k, v ) acc =
    if v then
        fromString k :: acc

    else
        acc
