module Icon exposing
    ( Icon
    , file
    , folder
    , toHtml
    )

import Html.Styled exposing (Html)
import Svg.Styled as Svg exposing (Svg)
import Svg.Styled.Attributes as SA


type Icon msg
    = Icon (Html msg)


folder : Icon msg
folder =
    Icon
        (Svg.svg
            [ SA.viewBox "0 0 137 112" ]
            [ Svg.defs
                []
                [ Svg.linearGradient
                    [ SA.id "a"
                    , SA.y1 "62"
                    , SA.x2 "125"
                    , SA.y2 "62"
                    ]
                    [ Svg.stop [ SA.offset "0", SA.stopColor "#ffa01c" ] []
                    , Svg.stop [ SA.offset "1", SA.stopColor "#ef6300" ] []
                    ]
                ]
            , Svg.path
                [ SA.d "M55.25 12H6a6 6 0 0 0-6 6v88a6 6 0 0 0 6 6h113a6 6 0 0 0 6-6V32a6 6 0 0 0-6-6H75.75a6 6 0 0 1-4-1.48l-12.6-11a6 6 0 0 0-3.9-1.52z"
                , SA.fill "url(#a)"
                ]
                []
            , Svg.path
                [ SA.d "M129 104H16a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8h49.25a8 8 0 0 1 5.26 2l12.61 11a4 4 0 0 0 2.63 1H129a8 8 0 0 1 8 8v74a8 8 0 0 1-8 8zM16 4a4 4 0 0 0-4 4v88a4 4 0 0 0 4 4h113a4 4 0 0 0 4-4V22a4 4 0 0 0-4-4H85.75a8 8 0 0 1-5.26-2L67.88 5a4 4 0 0 0-2.63-1z"
                , SA.fill "#0d1f2d"
                ]
                []
            ]
        )


file : Icon msg
file =
    Icon
        (Svg.svg
            [ SA.viewBox "0 0 137 112" ]
            [ Svg.path
                [ SA.d "M119,12H55V41a6,6,0,0,1-6,6H12.41a1,1,0,0,1-.7-1.71l-10,10A6,6,0,0,0,0,59.49V106a6,6,0,0,0,6,6H119a6,6,0,0,0,6-6V18A6,6,0,0,0,119,12Z"
                , SA.fill "#0d1f2d"
                , SA.opacity "0.2"
                ]
                []
            , Svg.path
                [ SA.d "M129,0H57.49A8,8,0,0,0,52,2.21l-.09.08-.05,0h0L10.34,43.83h0l-.05.05-.08.09A8,8,0,0,0,8,49.49V96a8,8,0,0,0,8,8H129a8,8,0,0,0,8-8V8A8,8,0,0,0,129,0ZM53,6.83V41a4,4,0,0,1-4,4H14.83ZM133,96a4,4,0,0,1-4,4H16a4,4,0,0,1-4-4V49.49a3.87,3.87,0,0,1,.05-.49H49a8,8,0,0,0,8-8V4.05a3.87,3.87,0,0,1,.49,0H129a4,4,0,0,1,4,4Z"
                , SA.fill "#0d1f2d"
                ]
                []
            ]
        )



-- CONVERSIONS


toHtml : Icon msg -> Html msg
toHtml (Icon svg) =
    svg
