port module Main exposing (main)

import Browser
import Css
import FileSystem
import Html.Styled as Html exposing (Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)
import Json.Decode as Decode
import Options exposing (Options)
import Result exposing (Result)
import View.Var.Colors as Colors
import View.Var.Fonts as Fonts



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
        -- |> Result.mapError logError
        |> Result.withDefault viewErr


viewOk : ( Options, Bool ) -> Html Msg
viewOk ( opts, isOpen ) =
    let
        wrapperHeight =
            if isOpen then
                Css.height (Css.vh 100)

            else
                Css.height (Css.pct 100)
    in
    Html.styled Html.div
        [ wrapperHeight
        , Css.displayFlex
        , Css.flexDirection Css.column
        ]
        []
        [ Options.viewFiles
            { compileMsg = Compile
            , uncompileMsg = Uncompile
            , options = opts
            , files = FileSystem.view
            , isOpen = isOpen
            }
        , Options.viewCommand opts
        , viewToggle isOpen
        ]


viewToggle : Bool -> Html Msg
viewToggle isOpen =
    Html.styled Html.button
        [ Css.backgroundColor Colors.secondaryDarkest
        , Css.color Colors.white
        , Fonts.sans
        , Css.display Css.block
        , Css.width (Css.pct 100)
        , Css.fontSize (Css.rem 4)
        , Css.padding (Css.rem 5)
        , Css.fontWeight (Css.int 500)
        , Css.border3 (Css.rem 0.25) Css.solid Colors.secondaryDarkest
        ]
        [ onClick ToggleView ]
        [ Html.text (getToggleText isOpen) ]


getToggleText : Bool -> String
getToggleText isOpen =
    if isOpen then
        "Close File Preview"

    else
        "Open File Preview"



-- logError : Decode.Error -> Decode.Error
-- logError error =
--     Debug.log "Decoder Error:" error


viewErr : Html Msg
viewErr =
    Html.div [] [ Html.text "Sorry, there was an error decoding the flags for this scenario." ]



-- UPDATE --


type Msg
    = UpdateOptions Decode.Value
    | Compile
    | Uncompile
    | ToggleView


update : Msg -> Model -> ( Model, Cmd Msg )
update msg (Model res) =
    case msg of
        UpdateOptions json ->
            ( decodeModel json, Cmd.none )

        Compile ->
            ( compile res, Cmd.none )

        Uncompile ->
            ( uncompile res, Cmd.none )

        ToggleView ->
            ( toggleView res, Cmd.none )


compile : Result Decode.Error ( Options, Bool ) -> Model
compile result =
    Result.map (\( opts, isOpen ) -> ( Options.compile opts, isOpen )) result |> Model


uncompile : Result Decode.Error ( Options, Bool ) -> Model
uncompile result =
    Result.map (\( opts, isOpen ) -> ( Options.uncompile opts, isOpen )) result |> Model


toggleView : Result Decode.Error ( Options, Bool ) -> Model
toggleView result =
    Result.map (\( opts, isOpen ) -> ( opts, not isOpen )) result |> Model



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
