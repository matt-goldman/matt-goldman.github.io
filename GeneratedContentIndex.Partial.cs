using Blake.Types;

namespace Blake.Generated;

public static partial class GeneratedContentIndex
{
    public static List<PageModel> GetPages()
    {
        // Temporary implementation for development with sample data
        return new List<PageModel>
        {
            new PageModel 
            { 
                Slug = "/pages/about", 
                Title = "About", 
                IconIdentifier = "bi-person-fill" 
            },
            new PageModel 
            { 
                Slug = "/pages/blog", 
                Title = "Blog", 
                IconIdentifier = "bi-journal-text" 
            },
            new PageModel 
            { 
                Slug = "/pages/contact", 
                Title = "Contact", 
                IconIdentifier = "bi-envelope-fill" 
            }
        };
    }
}