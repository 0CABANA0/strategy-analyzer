import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <Mail className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">이메일 인증</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            가입하신 이메일로 인증 링크를 보냈습니다.<br />
            이메일을 확인하고 링크를 클릭해 주세요.
          </p>
          <Link
            to="/login"
            className="inline-block py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors no-underline"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
