namespace GoForGoldman.Utils;

public static class TagToColor
{
    public static string GetChipColor(this string tag)
    {
        return tag.ToLower() switch
        {
            "c#" => "purple",
            "javascript" => "yellow",
            "python" => "blue",
            "html" => "orange",
            "css" => "pink",
            "mobile" => "amber",
            "java" => "green",
            "ruby" => "red",
            "news" => "gray",
            "blazor" => "cyan",
            "tutorial" => "teal",
            "dotnet" => "indigo",
            "tips" => "lime",
            "book" => "amber",
            "article" => "violet",
            "blog" => "fuchsia",
            "career" or "productivity" or "leadership" or "management" => "emerald",
            "life" => "rose",
            "misc" => "slate",
            "ui" => "cyan",
            _ => "slate"
        };
    }
}
