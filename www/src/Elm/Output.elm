module Output exposing (Output, decoder)

import Json.Decode as Decode

type Output
  = None
  | Html
  | Js
  | JsRoot

decoder : Decode.Decoder Output
decoder =
  Decode.map fromString Decode.string

fromString : String -> Output
fromString raw =
  case raw of
    "html" -> Html
    "js" -> Js
    "js-root" -> JsRoot
    _ -> None
