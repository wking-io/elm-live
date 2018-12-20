module FileSystem exposing
    ( FileData
    , FileSystem(..)
    , FolderData
    , Node
    , firstTabActive
    , firstTabInactive
    , fromNode
    , lastTabActive
    , lastTabInactive
    , makeCssFile
    , makeElmFile
    , makeFolder
    , makeHtmlFile
    , makeJsFile
    , makeJsonFile
    , sort
    , spacer
    , view
    , wrapper
    )

import Css
import Css.Media as Media exposing (withMedia)
import FileSystem.Extension as Extension exposing (Extension(..))
import FileSystem.Id as Id exposing (Id)
import Html.Styled as Html exposing (Attribute, Html)
import Html.Styled.Attributes as HA
import Html.Styled.Events exposing (onClick)
import Icon exposing (Icon)
import View.Var.Colors as Colors
import View.Var.Fonts as Fonts
import View.Var.Sizes as Sizes exposing (screen)


type FileSystem
    = FileSystem Node


type Node
    = Folder FolderData (List Node)
    | File FileData


type alias FolderData =
    { id : Id
    , name : String
    }


type alias FileData =
    { id : Id
    , extension : Extension
    , name : String
    }


sort : Node -> String
sort node =
    case node of
        Folder { name } _ ->
            "a" ++ name

        File { name } ->
            "b" ++ name


makeFile : Extension -> String -> String -> Node
makeFile extension parent name =
    File
        { id = Id.generate (parent ++ name ++ Extension.toString extension)
        , extension = extension
        , name = name
        }


makeJsFile : String -> String -> Node
makeJsFile =
    makeFile Js


makeJsonFile : String -> String -> Node
makeJsonFile =
    makeFile Json


makeElmFile : String -> String -> Node
makeElmFile =
    makeFile Elm


makeCssFile : String -> String -> Node
makeCssFile =
    makeFile Css


makeHtmlFile : String -> String -> Node
makeHtmlFile =
    makeFile Html


makeFolder : String -> String -> List Node -> Node
makeFolder parent name children =
    Folder { id = Id.generate (parent ++ name), name = name } children


fromNode : Node -> FileSystem
fromNode =
    FileSystem



-- VIEW


type TabPosition
    = First
    | Last


type TabState
    = Active
    | Inactive


firstTabActive : List (Attribute msg) -> List (Html msg) -> Html msg
firstTabActive =
    tab ( First, Active )


firstTabInactive : List (Attribute msg) -> List (Html msg) -> Html msg
firstTabInactive =
    tab ( First, Inactive )


lastTabActive : List (Attribute msg) -> List (Html msg) -> Html msg
lastTabActive =
    tab ( Last, Active )


lastTabInactive : List (Attribute msg) -> List (Html msg) -> Html msg
lastTabInactive =
    tab ( Last, Inactive )


tab : ( TabPosition, TabState ) -> List (Attribute msg) -> List (Html msg) -> Html msg
tab tabSettings =
    let
        stateStyles =
            case tabSettings of
                ( First, Active ) ->
                    [ Css.backgroundColor Colors.white
                    , Css.borderTop3 (Css.px 1) Css.solid Colors.white
                    , Css.borderRight (Css.px 0)
                    , Css.borderBottom3 (Css.px 1) Css.solid Colors.secondaryDarkest
                    , Css.borderLeft (Css.px 0)
                    ]

                ( First, Inactive ) ->
                    [ Css.backgroundColor Colors.secondaryLightest
                    , Css.borderTop3 (Css.px 1) Css.solid Colors.secondaryDarkest
                    , Css.borderRight3 (Css.px 1) Css.solid Colors.secondaryDarkest
                    , Css.borderBottom3 (Css.px 1) Css.solid Colors.secondaryDarkest
                    , Css.borderLeft3 (Css.px 1) Css.solid Colors.white
                    ]

                ( Last, Active ) ->
                    [ Css.backgroundColor Colors.white
                    , Css.borderTop3 (Css.px 1) Css.solid Colors.white
                    , Css.borderRight (Css.px 0)
                    , Css.borderBottom3 (Css.px 1) Css.solid Colors.secondaryDarkest
                    , Css.borderLeft (Css.px 0)
                    ]

                ( Last, Inactive ) ->
                    [ Css.backgroundColor Colors.secondaryLightest
                    , Css.borderTop3 (Css.px 1) Css.solid Colors.secondaryDarkest
                    , Css.borderRight3 (Css.px 1) Css.solid Colors.white
                    , Css.borderBottom3 (Css.px 1) Css.solid Colors.secondaryDarkest
                    , Css.borderLeft3 (Css.px 1) Css.solid Colors.secondaryDarkest
                    ]
    in
    Html.styled Html.button
        ([ Css.width (Css.pct 50)
         , Fonts.sans
         , Css.fontSize (Css.rem 4)
         , Css.padding (Css.rem 5)
         , Css.fontWeight (Css.int 500)
         ]
            ++ stateStyles
        )


wrapper : Bool -> List (Attribute msg) -> List (Html msg) -> Html msg
wrapper isOpen =
    let
        display =
            if isOpen then
                Css.displayFlex

            else
                Css.display Css.none
    in
    Html.styled Html.div
        [ display
        , Css.flexDirection Css.columnReverse
        , Css.height (Css.pct 100)
        , withMedia [ Media.only Media.screen [ Media.minWidth screen.md ] ]
            [ Css.displayFlex
            ]
        ]


spacer : List (Attribute msg) -> List (Html msg) -> Html msg
spacer =
    Html.styled Html.div
        [ Css.padding4 (Css.rem 3) (Css.rem 6) (Css.rem 6) (Css.rem 6)
        , Css.flex (Css.int 1)
        , withMedia [ Media.only Media.screen [ Media.minWidth screen.md ] ]
            [ Css.padding4 (Css.rem 6) (Css.rem 12) (Css.rem 12) (Css.rem 12)
            ]
        ]


view : FileSystem -> Html msg
view (FileSystem node) =
    case node of
        Folder data children ->
            Html.div []
                [ viewRootFolder data
                , List.concatMap viewHelp children
                    |> viewLevel [ HA.id (Id.toString data.id) ]
                ]

        File data ->
            Html.div [] [ viewFile data ]


viewHelp : Node -> List (Html msg)
viewHelp node =
    case node of
        Folder data children ->
            [ viewFolder data
            , List.concatMap viewHelp children
                |> viewLevel [ HA.id (Id.toString data.id) ]
            ]

        File data ->
            [ viewFile data ]


viewLevel : List (Attribute msg) -> List (Html msg) -> Html msg
viewLevel =
    Html.styled Html.div
        [ Css.marginLeft (Css.rem 4)
        , Css.paddingLeft (Css.rem 8)
        , Css.position Css.relative
        , Css.before
            [ Css.property "content" "''"
            , Css.position Css.absolute
            , Css.height (Css.pct 100)
            , Css.width (Css.rem 0.5)
            , Css.backgroundColor Colors.secondaryLighter
            , Css.left (Css.rem 0)
            , Css.top (Css.rem -4)
            ]
        ]


viewRootFolder : FolderData -> Html msg
viewRootFolder { id, name } =
    viewNode True Icon.folder name


viewFolder : FolderData -> Html msg
viewFolder { id, name } =
    viewNode False Icon.folder name


viewFile : FileData -> Html msg
viewFile { id, name, extension } =
    viewNode False Icon.file (name ++ Extension.toExtension extension)


viewNode : Bool -> Icon msg -> String -> Html msg
viewNode isRoot icon name =
    let
        before =
            if isRoot then
                []

            else
                [ Css.property "content" "''"
                , Css.position Css.absolute
                , Css.height (Css.rem 0.5)
                , Css.width (Css.rem 5)
                , Css.backgroundColor Colors.secondaryLighter
                , Css.left (Css.rem -8)
                , Css.top (Css.pct 50)
                , Css.transform (Css.translateY (Css.pct -50))
                ]
    in
    Html.styled Html.div
        [ Css.displayFlex
        , Css.alignItems Css.center
        , Css.marginBottom (Css.rem 5)
        , Css.position Css.relative
        , Css.before before
        ]
        []
        [ viewIcon [] [ Icon.toHtml icon ]
        , Html.styled Html.p [ Fonts.mono, Css.lineHeight (Css.pct 100), Css.margin4 (Css.rem 0) (Css.rem 0) (Css.rem 2) (Css.rem 0) ] [] [ Html.text name ]
        ]


viewIcon : List (Attribute msg) -> List (Html msg) -> Html msg
viewIcon =
    Html.styled Html.div
        [ Css.width (Css.rem 8), Css.marginRight (Css.rem 4) ]
