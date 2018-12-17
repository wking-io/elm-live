port module Main exposing (main)

import Browser
import Css
import FileSystem
import Html.Styled as Html exposing (Html)
import Json.Decode as Decode
import Options exposing (Options)
import Result exposing (Result)



-- MODEL --


type Model
    = Model (Result Decode.Error ( Options, Bool ))


init : Decode.Value -> ( Model, Cmd Msg )
init flags =
    ( decodeModel flags, Cmd.none )


decodeModel : Decode.Value -> Model
decodeModel flags =
    Decode.decodeValue Options.decoder flags
        |> Result.map (\opts -> ( opts, False ))
        |> Model



-- VIEW --


view : Model -> Html Msg
view (Model res) =
    res
        |> Result.map viewOk
        |> Result.mapError logError
        |> Result.withDefault viewErr


viewOk : ( Options, Bool ) -> Html Msg
viewOk ( opts, isOpen ) =
    Html.styled Html.div
        [ Css.height (Css.pct 100) ]
        []
        [ Options.viewFiles
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
update msg (Model res) =
    case msg of
        UpdateOptions json ->
            ( decodeModel json, Cmd.none )

        Compile ->
            ( compile res, Cmd.none )

        Uncompile ->
            ( uncompile res, Cmd.none )


compile : Result Decode.Error ( Options, Bool ) -> Model
compile result =
    Result.map (\( opts, isOpen ) -> ( Options.compile opts, isOpen )) result |> Model


uncompile : Result Decode.Error ( Options, Bool ) -> Model
uncompile result =
    Result.map (\( opts, isOpen ) -> ( Options.uncompile opts, isOpen )) result |> Model



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
