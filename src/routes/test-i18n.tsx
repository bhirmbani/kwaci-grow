import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useLanguageStore } from '../lib/stores/languageStore'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

function TestI18nComponent() {
  const { t } = useTranslation()
  const { currentLanguage, availableLanguages } = useLanguageStore()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">i18n Implementation Test</h1>
        <LanguageSwitcher showLabel={true} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Language Status */}
        <Card>
          <CardHeader>
            <CardTitle>Language Status</CardTitle>
            <CardDescription>Current language configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Current Language:</span>
              <Badge variant="default">{currentLanguage}</Badge>
              <span>({availableLanguages[currentLanguage]})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Available Languages:</span>
              {Object.entries(availableLanguages).map(([code, name]) => (
                <Badge key={code} variant="outline">{code}: {name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Translations */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Translations</CardTitle>
            <CardDescription>Testing navigation menu translations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Dashboard:</strong> {t('navigation.dashboard')}</div>
            <div><strong>Settings:</strong> {t('navigation.settings')}</div>
            <div><strong>Analytics:</strong> {t('navigation.analytics')}</div>
            <div><strong>Accounting:</strong> {t('navigation.accounting')}</div>
            <div><strong>Operations:</strong> {t('navigation.operations')}</div>
          </CardContent>
        </Card>

        {/* Common UI Translations */}
        <Card>
          <CardHeader>
            <CardTitle>Common UI Elements</CardTitle>
            <CardDescription>Testing common UI translations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Loading:</strong> {t('common.loading')}</div>
            <div><strong>Save:</strong> {t('common.save')}</div>
            <div><strong>Cancel:</strong> {t('common.cancel')}</div>
            <div><strong>Delete:</strong> {t('common.delete')}</div>
            <div><strong>Search:</strong> {t('common.search')}</div>
          </CardContent>
        </Card>

        {/* KWACI Acronym */}
        <Card>
          <CardHeader>
            <CardTitle>KWACI Acronym (Mixed)</CardTitle>
            <CardDescription>Testing KWACI acronym translations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>K:</strong> {t('kwaci.acronyms.mixed.k')} - {t('kwaci.acronyms.mixed.kDesc')}</div>
            <div><strong>W:</strong> {t('kwaci.acronyms.mixed.w')} - {t('kwaci.acronyms.mixed.wDesc')}</div>
            <div><strong>A:</strong> {t('kwaci.acronyms.mixed.a')} - {t('kwaci.acronyms.mixed.aDesc')}</div>
            <div><strong>C:</strong> {t('kwaci.acronyms.mixed.c')} - {t('kwaci.acronyms.mixed.cDesc')}</div>
            <div><strong>I:</strong> {t('kwaci.acronyms.mixed.i')} - {t('kwaci.acronyms.mixed.iDesc')}</div>
          </CardContent>
        </Card>

        {/* Language Switching */}
        <Card>
          <CardHeader>
            <CardTitle>Language Switching</CardTitle>
            <CardDescription>Test language switching functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Use the language switcher in the top-right corner to test language switching.
              The language preference should persist across browser sessions.
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{t('language.switchLanguage')}:</span>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Groups</CardTitle>
            <CardDescription>Testing sidebar group translations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Navigation:</strong> {t('sidebarGroups.navigation')}</div>
            <div><strong>Learning & Support:</strong> {t('sidebarGroups.learningSupport')}</div>
            <div><strong>Quick Actions:</strong> {t('sidebarGroups.quickActions')}</div>
            <div><strong>Dev Tools:</strong> {t('sidebarGroups.devTools')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
          <CardDescription>Key features of the i18n implementation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Language preferences persist in localStorage with key 'kwaci-language'</li>
            <li>Language switching is handled by zustand store with toast notifications</li>
            <li>TypeScript support with type-safe translation keys</li>
            <li>Integration with existing business context (language changes don't affect business selection)</li>
            <li>Fallback to English for missing translations</li>
            <li>Sidebar navigation fully internationalized</li>
            <li>KWACI acronym variations available in both languages</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/test-i18n')({
  component: TestI18nComponent,
})
