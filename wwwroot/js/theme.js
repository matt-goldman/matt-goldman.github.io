// Theme management for dark mode support
export class ThemeManager {
    constructor() {
        this.themes = {
            LIGHT: 'light',
            DARK: 'dark',
            SYSTEM: 'system'
        };
        this.storageKey = 'theme-preference';
        this.currentTheme = this.getTheme();
        this.init();
    }

    init() {
        // Apply the current theme on initialization
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (this.currentTheme === this.themes.SYSTEM) {
                    this.applyTheme(this.themes.SYSTEM);
                }
            });
        }
    }

    getTheme() {
        // Get theme from localStorage, default to system
        const stored = localStorage.getItem(this.storageKey);
        if (stored && Object.values(this.themes).includes(stored)) {
            return stored;
        }
        return this.themes.SYSTEM;
    }

    setTheme(theme) {
        if (!Object.values(this.themes).includes(theme)) {
            console.warn('Invalid theme:', theme);
            return;
        }
        
        this.currentTheme = theme;
        localStorage.setItem(this.storageKey, theme);
        this.applyTheme(theme);
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { 
                theme: theme,
                resolvedTheme: this.getResolvedTheme(theme)
            } 
        }));
        
        // Update Giscus theme if available
        this.updateGiscusTheme(this.getResolvedTheme(theme));
    }

    applyTheme(theme) {
        const html = document.documentElement;
        const resolvedTheme = this.getResolvedTheme(theme);
        
        // Remove existing theme classes
        html.classList.remove('dark', 'light');
        
        // Add the resolved theme class
        if (resolvedTheme === this.themes.DARK) {
            html.classList.add('dark');
        } else {
            html.classList.add('light');
        }
        
        // Update data attribute for styling purposes
        html.setAttribute('data-theme', theme);
        html.setAttribute('data-resolved-theme', resolvedTheme);
    }

    getResolvedTheme(theme) {
        if (theme === this.themes.SYSTEM) {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return this.themes.DARK;
            }
            return this.themes.LIGHT;
        }
        return theme;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getResolvedCurrentTheme() {
        return this.getResolvedTheme(this.currentTheme);
    }

    // Cycle through themes for simple toggle
    toggleTheme() {
        const themes = [this.themes.LIGHT, this.themes.DARK, this.themes.SYSTEM];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }

    // Update Giscus theme integration
    updateGiscusTheme(resolvedTheme) {
        try {
            // Find all Giscus containers and update their theme
            const giscusContainers = document.querySelectorAll('#giscus_thread');
            giscusContainers.forEach(container => {
                if (window.giscus && window.giscus.setTheme) {
                    window.giscus.setTheme(container.parentElement, resolvedTheme);
                }
            });
        } catch (error) {
            console.debug('Giscus theme update failed:', error);
        }
    }
}

// Create global instance
window.themeManager = new ThemeManager();

// Export for ES modules
export default window.themeManager;