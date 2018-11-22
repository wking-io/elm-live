port module Main exposing (main)

import Browser
import FileSystem
import Html.Styled as Html exposing (Html)
import Json.Decode as Decode
import Options exposing (Options)
import Result exposing (Result)



-- MODEL --


type Model
    = Model (Result Decode.Error Options)


init : Decode.Value -> ( Model, Cmd Msg )
init flags =
    ( decodeModel flags, Cmd.none )


decodeModel : Decode.Value -> Model
decodeModel flags =
    Decode.decodeValue Options.decoder flags
        |> Model



-- VIEW --


view : Model -> Html Msg
view (Model res) =
    res
        |> Result.map viewOk
        |> Result.mapError logError
        |> Result.withDefault viewErr


viewOk : Options -> Html Msg
viewOk opts =
    Html.div []
        [ Options.view
            { compileMsg = Compile
            , uncompileMsg = Uncompile
            , options = opts
            , files = FileSystem.view
            }
        ]


logError : Decode.Error -> Decode.Error
logError error =
    Debug.log "Decoder Error:" error


viewErr : Html Msg
viewErr =
    Html.div [] [ Html.text "Sorry, there was an error decoding the flags for this scenario." ]



-- UPDATE --


type Msg
    = UpdateOptions Decode.Value
    | Compile
    | Uncompile


update : Msg -> Model -> ( Model, Cmd Msg )
update msg (Model optionsRes) =
    case msg of
        UpdateOptions json ->
            ( decodeModel json, Cmd.none )

        Compile ->
            ( Result.map Options.compile optionsRes |> Model, Cmd.none )

        Uncompile ->
            ( Result.map Options.uncompile optionsRes |> Model, Cmd.none )



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
        , view = view >> Html.toUnstyled
        , update = update
        , subscriptions = subscriptions
        }
