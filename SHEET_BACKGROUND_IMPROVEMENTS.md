# Sheet Component Background Styling Improvements

## Overview
Enhanced the Sheet component's background styling to use solid, theme-aware backgrounds that automatically adapt to light and dark modes with proper CSS specificity using `!important` declarations.

## Changes Made

### 1. Enhanced CSS Styling (`src/index.css`)

#### Sheet Overlay Improvements
- Updated overlay to use theme-aware background colors: `hsl(var(--background) / 0.2)` for light mode and `hsl(var(--background) / 0.8)` for dark mode
- Added consistent backdrop-filter blur effect
- Improved transition animations

#### Main Sheet Content Styling
- Enforced solid background using `hsl(var(--background))` with `!important`
- Added proper theme-aware text color using `hsl(var(--foreground))`
- Enhanced box-shadow with theme-aware opacity
- Added comprehensive state handling for open/closed states

#### Enhanced Theme Consistency
- All cards inside sheets now use `hsl(var(--card))` background with `hsl(var(--card-foreground))` text
- Tables, headers, and form elements maintain theme consistency
- Input fields, buttons, and interactive elements respect theme colors
- Added proper border styling using `hsl(var(--border))`

#### Comprehensive Element Coverage
- **Tables**: All table elements (thead, tbody, tr, th, td) use theme-aware backgrounds
- **Forms**: Input, textarea, and select elements maintain theme consistency
- **Buttons**: Default button styling respects secondary theme colors
- **Headers/Footers**: Sheet headers and footers use transparent backgrounds with proper text colors
- **Scrollable Content**: Overflow containers maintain theme backgrounds

### 2. Sheet Component Updates (`src/components/ui/sheet.tsx`)

#### SheetVariants Improvements
- Added explicit `border-border` class for consistent border theming
- Enhanced all side variants (top, bottom, left, right, right-wide) with proper border colors
- Maintained existing animation and transition properties

#### SheetOverlay Updates
- Changed from hardcoded `bg-black/20 dark:bg-black/80` to theme-aware `bg-background/20 dark:bg-background/80`
- Added smooth transition duration for better user experience
- Maintains backdrop blur effect for visual depth

## Key Features

### 1. Solid Backgrounds
- All Sheet components now have completely solid backgrounds
- No transparency or semi-transparent elements that could cause visibility issues
- Proper opacity handling with `opacity: 1 !important`

### 2. Theme Awareness
- Automatically adapts to light/dark mode using CSS custom properties
- Uses the application's existing theme system (`--background`, `--foreground`, etc.)
- Consistent with the overall application color scheme

### 3. CSS Specificity
- All critical styles use `!important` declarations to override default shadcn/ui styling
- Comprehensive selector coverage using `[data-radix-dialog-content]` for all Sheet content
- Fallback colors provided in case CSS variables fail

### 4. Cross-Component Consistency
- All Sheet components (FinancialTermsSheet, BonusSchemeSheet, InitialCapitalSheet, FixedCostsSheet, VariableCOGSSheet) benefit from these improvements
- Consistent styling across different sheet types and content

## Browser Compatibility
- Uses modern CSS features (CSS custom properties, HSL color functions)
- Fallback colors provided for older browsers
- Compatible with the existing Tailwind CSS setup

## Testing
- Development server running on http://localhost:5173/
- All Sheet components should now display with solid, theme-appropriate backgrounds
- Theme switching should work seamlessly without transparency issues

## Future Enhancements
- Consider adding animation preferences for users who prefer reduced motion
- Potential for custom theme color overrides per Sheet type
- Enhanced accessibility features for high contrast modes
