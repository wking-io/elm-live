module Command exposing (Command, addElmFlag, addLiveFlag, empty, toString)


type Command
    = Command (List String) (List String)


addLiveFlag : String -> Command -> Command
addLiveFlag flag (Command liveArgs elmArgs) =
    Command (liveArgs ++ [ flag ]) elmArgs


addElmFlag : String -> Command -> Command
addElmFlag flag (Command liveArgs elmArgs) =
    Command liveArgs (elmArgs ++ [ flag ])


toString : Command -> String
toString (Command liveFlags makeFlags) =
    "elm-live src/Main.elm" ++ String.join " " liveFlags ++ " -- " ++ String.join " " makeFlags


empty : Command
empty =
    Command [] []
