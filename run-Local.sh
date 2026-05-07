#!/usr/bin/env fish
#
# Runs the Blake site locally. Several plugins require specific arguments to function properly.
# These are already set up in the workflow, but this script lets you run the site without having to
# provide all the arguments manually.

if not command -v blake >/dev/null 2>&1
    echo "Blake is not installed or not available in the system PATH. Please install Blake to proceed:" >&2
    echo "    dotnet tool install -g Blake.CLI" >&2
    exit 1
end

blake bake -cl -dr --rss:ignore-path="/pages" --social:baseurl="https://goforgoldman.com" --rss:baseurl="https://goforgoldman.com" --readtime:wpm=500 --include-drafts
or exit $status

dotnet run