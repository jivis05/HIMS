# Design System Strategy: The Clinical Sanctuary

## 1. Overview & Creative North Star
This design system moves away from the "cold, sterile clinic" aesthetic of traditional healthcare software. Instead, our Creative North Star is **"The Clinical Sanctuary."** We aim to provide hospital administrators with a high-end, editorial-grade environment that feels authoritative yet calming.

To break the "standard SaaS template" look, this system utilizes **intentional asymmetry** and **tonal layering**. We replace rigid, boxed-in grids with fluid, breathable compositions. By leveraging heavy-weight display typography against expansive white space and glassmorphism, we create a sense of "digital high-ceiling" architecture—giving users the mental room to make critical decisions.

## 2. Colors & Surface Philosophy
The palette is grounded in medical trust but elevated through sophisticated tonal shifts. We do not use "flat" colors; we use "atmospheric" ones.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` component should sit on a `surface` background to define its edge. 

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of premium materials.
- **Lowest Tier (`surface-container-lowest` / #ffffff):** Use for primary action cards and critical data points that need to "pop."
- **Base Tier (`surface` / #f7f9fb):** The canvas of the application.
- **High Tier (`surface-container-high` / #e6e8ea):** Use for persistent navigation or utility panels.

### The "Glass & Gradient" Rule
To achieve the "Premium SaaS" feel, the top global header must utilize **Glassmorphism**:
- **Background:** `surface` at 70% opacity.
- **Backdrop Blur:** 20px - 32px.
- **Signature Gradient:** Main CTAs or Hero status cards should use a subtle linear gradient from `primary` (#004ac6) to `primary_container` (#2563eb) at a 135-degree angle to inject "soul" into the data.

## 3. Typography: Editorial Authority
We use a dual-font strategy to balance human warmth with clinical precision.

*   **Display & Headlines (Manrope):** High-contrast, wide-tracking headers that feel like a premium medical journal.
    *   *Headline-LG (2rem):* For page titles and high-level hospital metrics.
*   **Body & Labels (Inter):** Highly legible, neutral sans-serif for dense patient data.
    *   *Body-MD (0.875rem):* The workhorse for all administrative table data.
*   **Hierarchy Note:** Use `on_surface_variant` (#434655) for secondary labels to create a sophisticated grey-scale hierarchy that guides the eye toward the `on_surface` (#191c1e) primary information.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural lines.

- **The Layering Principle:** Place a `surface-container-lowest` card (Pure White) on a `surface-container-low` section to create a soft, natural lift.
- **Ambient Shadows:** For floating modals or dropdowns, use "Ambient Shadows." 
    *   *Spec:* `Y: 8px, Blur: 24px, Spread: -4px`.
    *   *Color:* Use `on_surface` at 6% opacity. Never use pure black or dark grey shadows.
- **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., in high-density data views), use a **Ghost Border**: `outline-variant` (#c3c6d7) at 15% opacity. 100% opaque borders are forbidden.

## 5. Components & Primitive Styling

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `DEFAULT` (0.5rem) or `lg` (1rem) roundedness. No border.
- **Secondary:** `secondary_container` background with `on_secondary_container` text.
- **Tertiary/Ghost:** No background. Use `primary` text weight 600.

### Input Fields
- **Styling:** Soft `md` (0.75rem) rounded corners. Background should be `surface_container_low`.
- **States:** On focus, the background shifts to `surface_container_lowest` with a 2px `surface_tint` (#0053db) "inner" shadow.

### Cards & Lists (The "Anti-Divider" Rule)
- **Forbid Dividers:** Do not use horizontal lines to separate list items. 
- **Spacing Separation:** Use the Spacing Scale (specifically `spacing-4` or `spacing-6`) to create "gutter-based" separation.
- **Tonal Alternation:** For large tables, use alternating background rows between `surface` and `surface_container_low`.

### Specialized Hospital Components
- **Patient Status Chips:** Use `tertiary_container` (#007d55) for "Stable" and `error_container` (#ffdad6) for "Urgent." These must be pill-shaped (`full` roundedness) with `label-sm` typography.
- **Glass Header:** The persistent top-bar must maintain the blur effect to allow the hospital's vibrant dashboard colors to bleed through as the user scrolls, maintaining a sense of layered depth.

## 6. Do's and Don'ts

### Do:
- **Use "White Space" as a Tool:** Use `spacing-12` (3rem) between major sections to allow the eye to rest.
- **Nesting Surfaces:** Place darker surfaces inside lighter ones to imply "inset" utility areas.
- **Subtle Motion:** Use 200ms ease-in-out transitions for all hover states to reinforce the "Premium" feel.

### Don't:
- **No Pure Black:** Never use #000000. Use `on_surface` (#191c1e) for text and `dark_steel` (#1E293B) for deep backgrounds.
- **No Harsh Corners:** Avoid 0px or 2px radiuses. Stick to the `DEFAULT` (8px) or `lg` (16px) scale to maintain the "Soft Minimalist" aesthetic.
- **No Grid Overload:** Do not force every metric into a square box. Use asymmetrical widths (e.g., a 60% width main chart next to a 40% width stat list) to create visual interest.
