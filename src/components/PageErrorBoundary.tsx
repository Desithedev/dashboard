import { Component, ErrorInfo, ReactNode } from 'react'
import Icon from './Icon'

interface Props {
  children: ReactNode
  pageName: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`PageErrorBoundary [${this.props.pageName}] caught an error:`, error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoToDashboard = () => {
    window.location.hash = '#dashboard'
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            minHeight: '400px',
          }}
        >
          <div
            role="alert"
            aria-live="assertive"
            style={{
              maxWidth: '520px',
              width: '100%',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <Icon name="exclamation-triangle" size={48} style={{ color: '#FF453A' }} />
            </div>

            <div
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 69, 58, 0.9)',
                background: 'rgba(255, 69, 58, 0.1)',
                border: '1px solid rgba(255, 69, 58, 0.2)',
                borderRadius: '4px',
                padding: '3px 10px',
                marginBottom: '16px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {this.props.pageName}
            </div>

            <h2
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.92)',
                marginBottom: '12px',
                letterSpacing: '-0.02em',
              }}
            >
              Siden kunne ikke indlæses
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.55)',
                marginBottom: '8px',
                lineHeight: '1.6',
              }}
            >
              {this.state.error?.message || 'Der opstod en uventet fejl på denne side.'}
            </p>

            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.3)',
                marginBottom: '32px',
                fontFamily: 'monospace',
              }}
            >
              Resten af appen kører stadig normalt.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
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
                <Icon name="arrow-path" size={14} />
                Prøv igen
              </button>

              <button
                onClick={this.handleGoToDashboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
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
                <Icon name="grid" size={14} />
                Ga til Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
