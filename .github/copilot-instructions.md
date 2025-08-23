# GoForGoldman Blog - GitHub Copilot Instructions

**ALWAYS follow these instructions first and fallback to search or additional context gathering only when the information here is incomplete or found to be in error.**

This is a Blazor WebAssembly blog built with Blake - a custom static site generator that converts Markdown to Razor. The site is deployed to GitHub Pages via automated workflows.

## Working Effectively

### Prerequisites and Environment Setup
- Install .NET 9.0 SDK (required for Blake CLI and project compilation)
- Install Node.js v20+ and npm (required for Tailwind CSS processing)
- Install Blake CLI as global dotnet tool: `dotnet tool install -g Blake.CLI`

### Bootstrap and Build Process
1. **Install dependencies:**
   - `npm ci` -- installs exact npm dependencies (takes ~3 seconds)
   - Alternative: `npm install` for fresh dependency resolution

2. **Generate static content from Markdown:**
   - `blake bake -cl -dr --rss:ignore-path="/pages" --social:base-url="https://goforgoldman.com" --rss:baseurl="https://goforgoldman.com" --readtime:wpm=500`
   - Takes ~7 seconds. NEVER CANCEL.
   - `-cl` cleans the .generated folder before regenerating
   - `-dr` disables default Bootstrap container renderers
   - RSS and social parameters are required for proper metadata generation

3. **Build CSS:**
   - `npm run build:css` -- processes Tailwind CSS (takes ~1 second)

4. **Build and publish the application:**
   - `dotnet publish -c Release -o release --nologo` -- builds the Blazor WebAssembly app
   - Takes ~42 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
   - Includes automatic CSS build via MSBuild targets
   - Warnings about nullable references in Components/Author.razor are expected

### Development Workflow
- **Run in development mode:**
  - `dotnet run` -- starts dev server on http://localhost:5187 (takes ~6 seconds to start)
  - Alternative: `blake serve` -- runs bake command first, then starts server
  - Both use launch settings from Properties/launchSettings.json

- **Watch mode for CSS:**
  - `npm run watch:css` -- automatically rebuilds CSS on changes

- **Watch mode for .NET:**
  - `dotnet watch` -- automatically rebuilds and restarts on code changes

### Build Timing Expectations
- Blake bake: ~7 seconds
- CSS build: ~1 second  
- .NET publish: ~42 seconds
- Dev server startup: ~6 seconds
- **TOTAL FULL BUILD: ~50 seconds**

**CRITICAL: NEVER CANCEL BUILD COMMANDS. Set timeout to minimum 120 seconds for dotnet publish operations.**

## Validation

### Manual Testing Requirements
After making changes to the codebase:

1. **ALWAYS run the complete build sequence:**
   ```bash
   blake bake -cl -dr --rss:ignore-path="/pages" --social:base-url="https://goforgoldman.com" --rss:baseurl="https://goforgoldman.com" --readtime:wpm=500
   npm run build:css
   dotnet publish -c Release -o release --nologo
   ```

2. **ALWAYS verify the application runs locally:**
   ```bash
   dotnet run
   ```
   - Access http://localhost:5187 in browser
   - Verify the homepage loads and displays blog posts
   - Check that navigation works between posts
   - Verify that post content renders correctly with proper formatting

3. **Key scenarios to validate:**
   - Homepage displays recent blog posts with proper styling
   - Individual blog posts load and render markdown content correctly
   - Navigation between posts works
   - Images and CSS styling load properly
   - RSS feed generation (in release build)

### Common Build Issues
- **Blake CLI not found:** Ensure .NET 9.0 SDK is installed and Blake CLI is installed globally
- **npm dependencies missing:** Run `npm ci` or `npm install`
- **CSS not updating:** Run `npm run build:css` manually
- **Nullable reference warnings:** Expected in Author.razor component, safe to ignore
- **RSS plugin warnings:** Expected when running blake commands without full parameters

## Repository Structure

### Key Directories
- `/Posts/` - Markdown blog posts (Blake converts these to Razor pages)
- `/Pages/` - Blazor pages and components
- `/Components/` - Reusable Blazor components
- `/Layout/` - Layout components
- `/wwwroot/` - Static files (CSS, images, JS)
- `/.generated/` - Auto-generated Razor files from Blake (git-ignored)
- `/release/` - Build output directory (git-ignored)

### Important Files
- `GoForGoldman.csproj` - Main project file with Blake configuration
- `package.json` - npm dependencies and scripts for Tailwind CSS
- `Program.cs` - Blazor app entry point
- `Properties/launchSettings.json` - Development server configuration
- `.github/workflows/deploy-pages.yml` - Deployment pipeline

## Blake Static Site Generator

Blake is a custom .NET tool that converts Markdown files to Razor components:

- **Core functionality:** Converts Markdown in `/Posts/` to Razor pages in `/.generated/`
- **Template system:** Uses `template.razor` files for page layouts
- **Plugin system:** Supports RSS, Open Graph, and other plugins via NuGet packages
- **Extensibility:** Built specifically for Blazor/Razor integration

### Blake Commands
- `blake bake` - Generate static content
- `blake serve` - Bake and run in development mode
- `blake init` - Initialize Blake in existing Blazor project
- `blake new` - Create new Blake site
- `blake --help` - Show all available commands and options

### Blake Configuration
Configuration is handled through:
- MSBuild targets in GoForGoldman.csproj
- Command-line parameters during bake
- Plugin-specific parameters (RSS, social, etc.)

## Deployment

The site automatically deploys to GitHub Pages via `.github/workflows/deploy-pages.yml`:

1. Install .NET 9.0 SDK
2. Install Blake CLI
3. Run blake bake with full parameters
4. Run dotnet publish
5. Copy build artifacts to GitHub Pages

**DO NOT manually modify the GitHub workflow unless absolutely necessary.**

## Common Tasks

### Adding a New Blog Post
1. Create new .md file in `/Posts/` directory
2. Include frontmatter with title, date, description, tags, etc.
3. Write content in Markdown
4. Run `blake bake` to generate Razor component
5. Test locally with `dotnet run`

### Modifying Styling
1. Edit CSS in `/wwwroot/css/app.css` (Tailwind input file)
2. Run `npm run build:css` to process with Tailwind
3. For development, use `npm run watch:css` for automatic rebuilding

### Updating Dependencies
- .NET packages: Modify GoForGoldman.csproj and run `dotnet restore`
- npm packages: Modify package.json and run `npm install`
- Blake CLI: Update with `dotnet tool update -g Blake.CLI`

### Troubleshooting Blake Issues
- Check Blake version: `blake --help`
- Clean generated content: Use `-cl` flag with bake command
- Verify markdown frontmatter format
- Check for plugin-specific requirements (baseurl for RSS, etc.)

## File Exclusions

The following directories are build artifacts and should NOT be committed:
- `/.generated/` - Blake-generated Razor files
- `/release/` - dotnet publish output
- `/node_modules/` - npm dependencies
- `/obj/` and `/bin/` - .NET build artifacts

Always use `.gitignore` to exclude these directories from version control.