'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // ChunkLoadError 특별 처리
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.log('ChunkLoadError detected, attempting page reload...')
      
      // 3초 후 페이지 새로고침
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 3000)
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isChunkError = this.state.error?.name === 'ChunkLoadError' || 
                          this.state.error?.message.includes('Loading chunk')

      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              {isChunkError ? '🔄' : '⚠️'}
            </div>
            
            <h2 className="error-title">
              {isChunkError ? '페이지 로딩 중...' : '오류가 발생했습니다'}
            </h2>
            
            <p className="error-message">
              {isChunkError 
                ? '새로운 페이지를 로딩하고 있습니다. 잠시만 기다려주세요.'
                : '예상치 못한 오류가 발생했습니다.'
              }
            </p>

            {isChunkError ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>자동으로 페이지를 새로고침합니다...</p>
              </div>
            ) : (
              <div className="error-actions">
                <button 
                  className="error-button primary"
                  onClick={this.handleReload}
                >
                  페이지 새로고침
                </button>
                <button 
                  className="error-button secondary"
                  onClick={this.handleRetry}
                >
                  다시 시도
                </button>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>개발자 정보</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--bg-primary, #ffffff);
              color: var(--text-primary, #333333);
              padding: 20px;
            }

            .error-container {
              max-width: 500px;
              text-align: center;
              background: var(--bg-secondary, #f8f9fa);
              border-radius: 12px;
              padding: 40px 30px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .error-icon {
              font-size: 4rem;
              margin-bottom: 20px;
              animation: pulse 2s infinite;
            }

            .error-title {
              font-size: 1.5rem;
              font-weight: 600;
              margin: 0 0 16px 0;
              color: var(--text-primary, #333333);
            }

            .error-message {
              font-size: 1rem;
              color: var(--text-secondary, #666666);
              margin: 0 0 30px 0;
              line-height: 1.5;
            }

            .loading-indicator {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
            }

            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid var(--border-color, #e0e0e0);
              border-top: 3px solid var(--accent-color, #007bff);
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }

            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              flex-wrap: wrap;
            }

            .error-button {
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              min-width: 120px;
            }

            .error-button.primary {
              background: var(--accent-color, #007bff);
              color: white;
            }

            .error-button.primary:hover {
              background: var(--accent-hover, #0056b3);
              transform: translateY(-1px);
            }

            .error-button.secondary {
              background: var(--bg-primary, #ffffff);
              color: var(--text-primary, #333333);
              border: 1px solid var(--border-color, #e0e0e0);
            }

            .error-button.secondary:hover {
              background: var(--bg-hover, #f0f0f0);
              transform: translateY(-1px);
            }

            .error-details {
              margin-top: 30px;
              text-align: left;
              background: var(--bg-primary, #ffffff);
              border-radius: 8px;
              padding: 16px;
              border: 1px solid var(--border-color, #e0e0e0);
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 500;
              margin-bottom: 12px;
              color: var(--text-secondary, #666666);
            }

            .error-stack {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: var(--text-secondary, #666666);
              white-space: pre-wrap;
              word-break: break-word;
              margin: 0;
              max-height: 200px;
              overflow-y: auto;
            }

            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @media (max-width: 480px) {
              .error-container {
                padding: 30px 20px;
              }

              .error-actions {
                flex-direction: column;
              }

              .error-button {
                width: 100%;
              }
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 