Global Theme Design Palette

Typography Standard (All Themes)

Font Family

Primary Font:

font-family: "Inter", sans-serif;

Fallback:

font-family: "Poppins", sans-serif;

---

Typography Scale

Element| Size| Weight
Dashboard Title| 32px| 700
Section Heading| 24px| 600
Card Title| 20px| 600
Large Metrics| 40px| 700
Metric Labels| 14px| 500
Body Text| 16px| 400
Secondary Text| 14px| 400
Small Labels| 12px| 500
Buttons| 16px| 600
Navigation Items| 15px| 500

---

Theme 1: Forest Green & Mint

Theme Identity

Natural, Eco-Friendly, Calm

Core Colors

--background-primary: #1B4332;
--background-secondary: #2D6A4F;
--background-card: #1B4332;
--accent-primary: #B7E4C7;
--accent-secondary: #D8F3DC;

Text Colors

--text-primary: #FFFFFF;
--text-secondary: #D8F3DC;
--text-disabled: #95D5B2;
--text-accent: #B7E4C7;

Border Colors

--border-color: #40916C;

Status Colors

--success: #52B788;
--warning: #F4A261;
--error: #E63946;

---

Theme 2: Navy Blue & Sky Blue

Theme Identity

Professional, Technology, Enterprise

Core Colors

--background-primary: #14213D;
--background-secondary: #1F3A5F;
--background-card: #14213D;
--accent-primary: #BDE0FE;
--accent-secondary: #E2EAF4;

Text Colors

--text-primary: #FFFFFF;
--text-secondary: #E2EAF4;
--text-disabled: #A9BCD0;
--text-accent: #BDE0FE;

Border Colors

--border-color: #4A6FA5;

Status Colors

--success: #4CC9F0;
--warning: #F4A261;
--error: #E63946;

---

Theme 3: Burgundy & Soft Pink

Theme Identity

Luxury, Creative, Premium

Core Colors

--background-primary: #6A040F;
--background-secondary: #9D0208;
--background-card: #6A040F;
--accent-primary: #F7CAD0;
--accent-secondary: #FDE2E4;

Text Colors

--text-primary: #FFF8F8;
--text-secondary: #FDE2E4;
--text-disabled: #E8B4BC;
--text-accent: #F7CAD0;

Border Colors

--border-color: #B5179E;

Status Colors

--success: #80ED99;
--warning: #F4A261;
--error: #FF4D6D;

---

Theme 4: Charcoal & Mustard

Theme Identity

Modern, Creative, Minimal

Core Colors

--background-primary: #2B2D42;
--background-secondary: #3C425A;
--background-card: #2B2D42;
--accent-primary: #E9C46A;
--accent-secondary: #F4D58D;

Text Colors

--text-primary: #FFFFFF;
--text-secondary: #EDF2F4;
--text-disabled: #8D99AE;
--text-accent: #E9C46A;

Border Colors

--border-color: #8D99AE;

Status Colors

--success: #52B788;
--warning: #E9C46A;
--error: #E63946;

---

Theme 5: Purple & Lavender

Theme Identity

AI, Analytics, Innovation

Core Colors

--background-primary: #3C096C;
--background-secondary: #5A189A;
--background-card: #3C096C;
--accent-primary: #E0AAFF;
--accent-secondary: #F3E8FF;

Text Colors

--text-primary: #FFFFFF;
--text-secondary: #F3E8FF;
--text-disabled: #C77DFF;
--text-accent: #E0AAFF;

Border Colors

--border-color: #9D4EDD;

Status Colors

--success: #80ED99;
--warning: #FFD166;
--error: #EF476F;

---

Component Usage Guidelines

Card Containers

Use:

background: var(--background-card);

Cards should occupy approximately 60% of the visual hierarchy.

---

Buttons

Primary Buttons:

background: var(--accent-primary);
color: var(--background-primary);

Secondary Buttons:

background: transparent;
border: 1px solid var(--border-color);
color: var(--text-primary);

---

Metric Cards

Metric Value:

font-size: 40px;
font-weight: 700;
color: var(--accent-primary);

Metric Label:

font-size: 14px;
font-weight: 500;
color: var(--text-secondary);

---

Navigation

Active Item:

background: var(--accent-primary);
color: var(--background-primary);

Inactive Item:

color: var(--text-secondary);

---

Dashboard Recommendation

For a Network Performance Analytics Dashboard:

1. Navy Blue & Sky Blue (Default Theme)
2. Purple & Lavender (AI Analytics Theme)
3. Forest Green & Mint
4. Charcoal & Mustard
5. Burgundy & Soft Pink

The default production theme should be Navy Blue & Sky Blue because it provides the strongest balance of professionalism, readability, accessibility, and trust for technical users.