import { useSettings } from '../hooks/useSettings'
import { getModelById } from '../data/modelDefinitions'
import ProfileSection from '../components/settings/ProfileSection'
import PasswordSection from '../components/settings/PasswordSection'
import ApiKeySection from '../components/settings/ApiKeySection'
import ThemeSection from '../components/settings/ThemeSection'
import AiParamsSection from '../components/settings/AiParamsSection'

export default function SettingsPage() {
  const { settings, envKeyExists } = useSettings()
  const selectedModel = getModelById(settings.model)

  return (
    <main id="main-content" className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">설정</h1>

      {/* 계정 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 mb-6">
        <ProfileSection />
        <PasswordSection />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        <ApiKeySection />
        <ThemeSection />
        <AiParamsSection />
      </div>

      {/* 현재 선택 요약 */}
      {selectedModel && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400 text-center">
          현재 모델: <strong className="text-gray-700 dark:text-gray-300">{selectedModel.name}</strong> ({selectedModel.provider})
          {' · '}입력 ${selectedModel.inputPrice}/M · 출력 ${selectedModel.outputPrice}/M
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
        API 키가 없으면 샘플 데이터로 체험할 수 있습니다.
        {!envKeyExists && ' 브라우저에 입력한 키는 LocalStorage에만 저장됩니다.'}
      </p>
    </main>
  )
}
