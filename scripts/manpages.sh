# /bin/bash -e

mkdir -p manpages

# * Strip everything before the title
# * Make the title marked-man-friendly
# * Strip the INSTALLATION guide (whoever is reading the manpage
#   has installed it already)
# * Strip HTML tags
# * Make sure the SYNOPSIS doesn’t look shitty
# * Render
cat Readme.md \
  | perl -0777 -pe 's|^[\S\s]*?\n(# )|$1|' \
  | perl -0777 -pe 's|(^# [^\s]+)\n\n\*\*(.+)  \n(.+)\*\*|$1(1) -- $2. $3|' \
  | perl -0777 -pe 's|\n## INSTALLATION[\S\s]*?(?=\n## )||' \
  | perl -0777 -pe 's#</?(?:a|p|img)[\S\s]*?>##g' \
  | perl -0777 -pe 's|```sh\n([\S\s]*?\n)```\n|$1|' \
  | marked-man \
    --version=v$(node -p 'require("./package.json").version') \
  > manpages/elm-live.1
