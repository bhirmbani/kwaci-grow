# Internationalization (i18n) Implementation Guide

## Overview

This document describes the implementation of internationalization (i18n) in the KWACI Grow application using react-i18next. The implementation supports English (default) and Bahasa Indonesia languages with persistent language preferences.

## Architecture

### Core Components

1. **i18n Configuration** (`src/lib/i18n/index.ts`)
   - Configures react-i18next with English and Indonesian support
   - Sets up localStorage persistence
   - Defines namespaces and fallback behavior

2. **Language Store** (`src/lib/stores/languageStore.ts`)
   - Zustand store for language state management
   - Handles language switching with persistence
   - Integrates with existing business context

3. **Language Switcher** (`src/components/LanguageSwitcher.tsx`)
   - UI component for language selection
   - Uses shadcn/ui patterns for consistency
   - Provides toast notifications for language changes

4. **Translation Files**
   - `src/lib/i18n/locales/en/common.json` - English translations
   - `src/lib/i18n/locales/id/common.json` - Indonesian translations

## Features Implemented

### ✅ Completed Features

1. **Package Installation**
   - Installed `react-i18next` and `i18next` packages
   - Added TypeScript support for translations

2. **i18n Configuration**
   - English (en) as default language
   - Bahasa Indonesia (id) as secondary language
   - localStorage persistence with key `kwaci-language`
   - Namespace organization for scalability

3. **Translation Coverage**
   - Navigation menu items and descriptions
   - Sidebar group labels
   - Common UI elements (buttons, actions, etc.)
   - KWACI acronym variations in both languages
   - User menu and settings

4. **Language Store**
   - Zustand-based state management
   - Persistent language preferences
   - Integration with i18next
   - Error handling for language switching

5. **Language Switcher Component**
   - Dropdown with flag icons
   - Toast notifications for language changes
   - Tooltip support
   - Loading states during language switching

6. **Root Layout Integration**
   - Language initialization in app startup
   - Language switcher in header next to theme toggle
   - Proper initialization order (language → database → business)

7. **TypeScript Support**
   - Type definitions for translation resources
   - Type-safe translation keys
   - IntelliSense support for translation functions

8. **AppSidebar Internationalization**
   - All navigation items translated
   - Dynamic translation key mapping
   - Sidebar group labels translated
   - User menu items translated

## Usage Examples

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <p>{t('navigationDescriptions.dashboard')}</p>
      <button>{t('common.save')}</button>
    </div>
  )
}
```

### Language Switching

```tsx
import { useLanguageStore } from '@/lib/stores/languageStore'

function LanguageExample() {
  const { changeLanguage, currentLanguage } = useLanguageStore()
  
  const handleLanguageChange = async () => {
    await changeLanguage(currentLanguage === 'en' ? 'id' : 'en')
  }
  
  return (
    <button onClick={handleLanguageChange}>
      Switch to {currentLanguage === 'en' ? 'Indonesian' : 'English'}
    </button>
  )
}
```

## Translation Structure

### Navigation Translations
```json
{
  "navigation": {
    "dashboard": "Dashboard / Dasbor",
    "settings": "Settings / Pengaturan",
    // ... other navigation items
  },
  "navigationDescriptions": {
    "dashboard": "Main financial dashboard / Dasbor keuangan utama",
    // ... descriptions
  }
}
```

### KWACI Acronym Translations
```json
{
  "kwaci": {
    "acronyms": {
      "mixed": {
        "name": "Mixed (Indonesian-English) / Campuran (Indonesia-Inggris)",
        "k": "Keuangan",
        "kDesc": "Finance / Keuangan"
        // ... other letters
      }
    }
  }
}
```

## Integration with Existing Systems

### Business Context Compatibility
- Language preferences persist independently of business switching
- Language changes don't affect business context
- Both systems use zustand for state management

### Theme Integration
- Language switcher placed next to theme toggle in header
- Consistent styling with existing UI patterns
- Uses shadcn/ui components for consistency

## File Structure

```
src/
├── lib/
│   ├── i18n/
│   │   ├── index.ts              # Main i18n configuration
│   │   ├── types.ts              # TypeScript type definitions
│   │   └── locales/
│   │       ├── en/
│   │       │   └── common.json   # English translations
│   │       └── id/
│   │           └── common.json   # Indonesian translations
│   └── stores/
│       └── languageStore.ts      # Language state management
├── components/
│   └── LanguageSwitcher.tsx      # Language switcher component
└── main.tsx                      # i18n initialization
```

## Next Steps for Extension

### Adding New Languages
1. Create new locale files in `src/lib/i18n/locales/{language}/`
2. Add language to `LANGUAGES` constant in `src/lib/i18n/index.ts`
3. Update language switcher component with new flag/option

### Adding New Namespaces
1. Create new namespace files (e.g., `forms.json`, `errors.json`)
2. Update `NAMESPACES` constant in i18n configuration
3. Add namespace to TypeScript types

### Translating New Components
1. Add translation keys to appropriate namespace files
2. Use `useTranslation()` hook in components
3. Replace hardcoded strings with `t()` function calls

## Testing

### Manual Testing Checklist
- [ ] Language switcher appears in header
- [ ] Language switching works without errors
- [ ] Language preference persists across browser sessions
- [ ] All navigation items display in selected language
- [ ] Toast notifications appear on language change
- [ ] No console errors during language switching
- [ ] Business context remains intact during language changes

### Test Component
A test component is available at `src/test-i18n.tsx` for manual verification of i18n functionality.

## Troubleshooting

### Common Issues
1. **Missing translations**: Check translation files for missing keys
2. **TypeScript errors**: Ensure types are updated when adding new translations
3. **Persistence issues**: Verify localStorage permissions and key naming
4. **Loading issues**: Check i18n initialization order in main.tsx

### Debug Mode
Set `debug: true` in i18n configuration for detailed logging during development.
