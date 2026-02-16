import { Component, ErrorInfo, ReactNode } from 'react'
import Icon from './Icon'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    window.location.reload()
  }

  handleGoToDashboard = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0a0a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <Icon name="exclamation-triangle" size={64} style={{ color: '#FF453A' }} />
            </div>

            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.92)',
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              Noget gik galt
            </h1>

            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.55)',
                marginBottom: '32px',
                lineHeight: '1.6',
              }}
            >
              {this.state.error?.message || 'Der opstod en uventet fejl i applikationen.'}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  background: 'linear-gradient(135deg, #007AFF 0%, rgba(0, 122, 255, 0.9) 100%)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3), 0 0 40px rgba(0, 122, 255, 0.15)',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0066d6 0%, rgba(0, 102, 214, 0.9) 100%)'
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 122, 255, 0.4), 0 0 60px rgba(0, 122, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, rgba(0, 122, 255, 0.9) 100%)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3), 0 0 40px rgba(0, 122, 255, 0.15)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Prøv igen
              </button>

              <button
                onClick={this.handleGoToDashboard}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#007AFF',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: 'rgba(0, 122, 255, 0.08)',
                  border: '1px solid rgba(0, 122, 255, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 122, 255, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.3)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 122, 255, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 122, 255, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.2)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Gå til Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
