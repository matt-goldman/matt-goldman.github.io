<#
.DESCRIPTION
    Runs the Blake site locally. Several plugins require specific arguments to function properly.
    These are already set up in the workflow, but this script lets you run the site without having to provide all the arguments manually.
#>

try {
    blake --help > $null 2>&1
} catch {
    Write-Error "Blake is not installed or not available in the system PATH. Please install Blake to proceed:"
    Write-Host "dotnet tool install -g Blake"
    exit 1
}

blake bake -cl -dr --rss:ignore-path="/pages" --social:baseurl="https://goforgoldman.com" --rss:baseurl="https://goforgoldman.com" --readtime:wpm=500 --include-drafts

dotnet run