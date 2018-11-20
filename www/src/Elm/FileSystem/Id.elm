module FileSystem.Id exposing (Id, equal, generate, toString)


type Id
    = Id String


generate : String -> Id
generate =
    Id


toString : Id -> String
toString (Id id) =
    id


equal : Id -> Id -> Bool
equal (Id x) (Id y) =
    x == y
