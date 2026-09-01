import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Erreur non gérée :", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isRemoveChild = this.state.error?.message.includes("removeChild");

      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff', textAlign: 'center', padding: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#E50914', marginBottom: '10px' }}>Oups !</h1>
            <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>
              {isRemoveChild
                ? "Une extension de navigateur (comme un traducteur) a interféré avec l'interface."
                : "Une erreur est survenue."}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{ background: '#C5A059', color: '#000', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ background: '#111', color: '#fff', padding: '10px 20px', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;