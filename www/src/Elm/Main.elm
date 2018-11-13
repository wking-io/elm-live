module Main exposing (main)

import Browser
import Html exposing (Html)
import Json.Decode as Decode
import Options exposing (Options)
import Result exposing (Result)

-- MODEL --
type Model
  = Model (Result Decode.Error Options)


init : Decode.Value -> ( Model, Cmd Msg )
init flags =
    ( decodeFlags flags, Cmd.none )

decodeFlags : Decode.Value -> Model
decodeFlags flags =
      flags
        |> Decode.decodeValue Options.decoder
        |> Model


-- VIEW --


view : Model -> Html Msg
view model =
    Html.div []
        [ Html.pre [] [ Html.text "Here" ]
        ]



-- UPDATE --


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        _ ->
            ( model, Cmd.none )



-- SUBSCRIPTIONS --


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- MAIN --


main : Program Decode.Value Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
