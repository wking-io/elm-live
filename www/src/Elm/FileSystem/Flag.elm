module FileSystem.Flag exposing (Flag(..), toHtml)

import Html.Styled exposing (Html)
import View.Pure.Checkbox as Checkbox


type Flag
    = Port
    | PathToElm
    | Host
    | Dir
    | StartPage
    | Open
    | NoRecover
    | Pushstate
    | ProxyHost
    | ProxyPrefix
    | BeforeBuild
    | AfterBuild
    | Debug
    | Output


toHtml : (Flag -> msg) -> Flag -> Html msg
toHtml msg flag =
    case flag of
        Port ->
            Checkbox.view
                { id = "options-port"
                , msg = msg Port
                , name = "--port"
                }

        PathToElm ->
            Checkbox.view
                { id = "options-path-to-elm"
                , msg = msg PathToElm
                , name = "--path-to-elm"
                }

        Host ->
            Checkbox.view
                { id = "options-host"
                , msg = msg Host
                , name = "--host"
                }

        Dir ->
            Checkbox.view
                { id = "options-dir"
                , msg = msg Dir
                , name = "--dir"
                }

        StartPage ->
            Checkbox.view
                { id = "options-start-page"
                , msg = msg StartPage
                , name = "--start-page"
                }

        Open ->
            Checkbox.view
                { id = "options-open"
                , msg = msg Open
                , name = "--open"
                }

        NoRecover ->
            Checkbox.view
                { id = "options-no-recover"
                , msg = msg NoRecover
                , name = "--no-recover"
                }

        Pushstate ->
            Checkbox.view
                { id = "options-pushstate"
                , msg = msg Pushstate
                , name = "--pushstate"
                }

        ProxyHost ->
            Checkbox.view
                { id = "options-proxy-host"
                , msg = msg ProxyHost
                , name = "--proxy-host"
                }

        ProxyPrefix ->
            Checkbox.view
                { id = "options-proxy-prefix"
                , msg = msg ProxyPrefix
                , name = "--proxy-prefix"
                }

        BeforeBuild ->
            Checkbox.view
                { id = "options-before-build"
                , msg = msg BeforeBuild
                , name = "--before-build"
                }

        AfterBuild ->
            Checkbox.view
                { id = "options-after-build"
                , msg = msg AfterBuild
                , name = "--after-build"
                }

        Debug ->
            Checkbox.view
                { id = "options-debug"
                , msg = msg Debug
                , name = "--debug"
                }

        Output ->
            Checkbox.view
                { id = "options-output"
                , msg = msg Output
                , name = "--output"
                }
