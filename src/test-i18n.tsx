import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguageStore } from './lib/stores/languageStore'
import { LanguageSwitcher } from './components/LanguageSwitcher'

// Simple test component to verify i18n functionality
export function TestI18n() {
  const { t } = useTranslation()
  const { currentLanguage } = useLanguageStore()

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">i18n Test</h1>
      
      <div className="space-y-2">
        <p><strong>Current Language:</strong> {currentLanguage}</p>
        <p><strong>Brand Name:</strong> {t('kwaci.brandName')}</p>
        <p><strong>Dashboard:</strong> {t('navigation.dashboard')}</p>
        <p><strong>Settings:</strong> {t('navigation.settings')}</p>
        <p><strong>Loading:</strong> {t('common.loading')}</p>
        <p><strong>Switch Language:</strong> {t('language.switchLanguage')}</p>
      </div>

      <div className="mt-4">
        <LanguageSwitcher showLabel={true} />
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold">KWACI Acronym (Mixed):</h3>
        <ul className="space-y-1">
          <li><strong>K:</strong> {t('kwaci.acronyms.mixed.k')} - {t('kwaci.acronyms.mixed.kDesc')}</li>
          <li><strong>W:</strong> {t('kwaci.acronyms.mixed.w')} - {t('kwaci.acronyms.mixed.wDesc')}</li>
          <li><strong>A:</strong> {t('kwaci.acronyms.mixed.a')} - {t('kwaci.acronyms.mixed.aDesc')}</li>
          <li><strong>C:</strong> {t('kwaci.acronyms.mixed.c')} - {t('kwaci.acronyms.mixed.cDesc')}</li>
          <li><strong>I:</strong> {t('kwaci.acronyms.mixed.i')} - {t('kwaci.acronyms.mixed.iDesc')}</li>
        </ul>
      </div>
    </div>
  )
}
