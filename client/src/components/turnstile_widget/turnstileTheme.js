// Turnstile only supports 'light' | 'dark' | 'auto'. Map each app theme
// (by its --bg-primary lightness) to the closest Turnstile theme so the
// widget blends with the active theme instead of following the OS setting.
const DARK_THEMES = new Set(['darkwood', 'dracula', 'monokai-pro', 'standard-dark']);

export function resolveTurnstileTheme(themeId) {
  return DARK_THEMES.has(themeId) ? 'dark' : 'light';
}

export default resolveTurnstileTheme;
