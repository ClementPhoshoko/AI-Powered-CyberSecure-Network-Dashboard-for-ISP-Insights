# Global Theme Design Palette

## Typography Standard (All Themes)

### Font Family

Primary Font:

```css
font-family: "Inter", sans-serif;
```

Fallback:

```css
font-family: "Poppins", sans-serif;
```

## Typography Scale

| Element | Size | Weight |
|----------|----------|----------|
| Dashboard Title | 32px | 700 |
| Section Heading | 24px | 600 |
| Card Title | 20px | 600 |
| Large Metrics | 40px | 700 |
| Metric Labels | 14px | 500 |
| Body Text | 16px | 400 |
| Secondary Text | 14px | 400 |
| Small Labels | 12px | 500 |
| Buttons | 16px | 600 |
| Navigation Items | 15px | 500 |

## Glass Morphism Guide (All Themes)

### Glass Effects Variables (Apply to any theme)

```css
/* Glass card effect */
--glass-card-bg: rgba(255, 255, 255, 0.1);
--glass-card-border: rgba(255, 255, 255, 0.2);
--glass-card-blur: 10px;

/* Glass backdrop */
--glass-backdrop: rgba(0, 0, 0, 0.3);

/* Glass shadows */
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Usage Example

```css
.glass-card {
  background: var(--glass-card-bg);
  backdrop-filter: blur(var(--glass-card-blur));
  border: 1px solid var(--glass-card-border);
  box-shadow: var(--glass-shadow);
  border-radius: 16px;
}
```

# Theme 1: Forest Green & Mint

```css
--background-primary: #1B4332;
--background-secondary: #2D6A4F;
--background-card: #1B4332;
--accent-primary: #B7E4C7;
--accent-secondary: #D8F3DC;

--text-primary: #FFFFFF;
--text-secondary: #D8F3DC;
--text-disabled: #95D5B2;
--text-accent: #B7E4C7;

--border-color: #40916C;
```

# Theme 2: Navy Blue & Sky Blue

```css
--background-primary: #14213D;
--background-secondary: #1F3A5F;
--background-card: #14213D;
--accent-primary: #BDE0FE;
--accent-secondary: #E2EAF4;

--text-primary: #FFFFFF;
--text-secondary: #E2EAF4;
--text-disabled: #A9BCD0;
--text-accent: #BDE0FE;

--border-color: #4A6FA5;
```

# Theme 3: Burgundy & Soft Pink

```css
--background-primary: #6A040F;
--background-secondary: #9D0208;
--background-card: #6A040F;
--accent-primary: #F7CAD0;
--accent-secondary: #FDE2E4;

--text-primary: #FFF8F8;
--text-secondary: #FDE2E4;
--text-disabled: #E8B4BC;
--text-accent: #F7CAD0;

--border-color: #B5179E;
```

# Theme 4: Charcoal & Mustard

```css
--background-primary: #2B2D42;
--background-secondary: #3C425A;
--background-card: #2B2D42;
--accent-primary: #E9C46A;
--accent-secondary: #F4D58D;

--text-primary: #FFFFFF;
--text-secondary: #EDF2F4;
--text-disabled: #8D99AE;
--text-accent: #E9C46A;

--border-color: #8D99AE;
```

# Theme 5: Purple &amp; Lavender

```css
--background-primary: #3C096C;
--background-secondary: #5A189A;
--background-card: #3C096C;
--accent-primary: #E0AAFF;
--accent-secondary: #F3E8FF;

--text-primary: #FFFFFF;
--text-secondary: #F3E8FF;
--text-disabled: #C77DFF;
--text-accent: #E0AAFF;

--border-color: #9D4EDD;
```

# Theme 6: Darcula (JetBrains)

```css
--background-primary: #2B2B2B;
--background-secondary: #3C3F41;
--background-card: #2B2B2B;
--accent-primary: #CC7832;
--accent-secondary: #A9B7C6;

--text-primary: #A9B7C6;
--text-secondary: #808080;
--text-disabled: #606060;
--text-accent: #CC7832;

--border-color: #4E4E4E;
```

# Theme 7: Light Mode (Clean)

```css
--background-primary: #FFFFFF;
--background-secondary: #F8F9FA;
--background-card: #FFFFFF;
--accent-primary: #4361EE;
--accent-secondary: #7209B7;

--text-primary: #1D3557;
--text-secondary: #457B9D;
--text-disabled: #A8DADC;
--text-accent: #4361EE;

--border-color: #E9ECEF;
```
