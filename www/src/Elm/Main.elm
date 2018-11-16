port module Main exposing (main)

import Browser
import Html exposing (Html)
import Json.Decode as Decode
import Options exposing (Options)
import FileSystem exposing (FileSystem)
import Result exposing (Result)

-- MODEL --
type Model
  = Model (Result Decode.Error FileSystem)


init : Decode.Value -> ( Model, Cmd Msg )
init flags =
    ( decodeModel flags, Cmd.none )

decodeModel : Decode.Value -> Model
decodeModel flags =
      flags
        |> Decode.decodeValue Options.decoder
        |> Result.map FileSystem.fromOptions


-- VIEW --


view : Model -> Html Msg
view model =
    Html.div []
        [ Html.pre [] [ Html.text "Here too" ]
        ]



-- UPDATE --


type Msg
    = UpdateOptions Decode.Value


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateOptions json ->
            ( decodeModel json, Cmd.none )



-- SUBSCRIPTIONS --

port options : (Decode.Value -> msg) -> Sub msg

subscriptions : Model -> Sub Msg
subscriptions model =
    options UpdateOptions



-- MAIN --


main : Program Decode.Value Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
