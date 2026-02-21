import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
            오류가 발생했습니다
          </h3>
          <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-4 max-w-md">
            {this.state.error?.message || '예기치 않은 오류가 발생했습니다.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
