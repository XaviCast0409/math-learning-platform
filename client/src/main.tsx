import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Necesitamos el Router aquí
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // 👈 Importar
import { SocketProvider } from './context/SocketContext'; //
import { ErrorBoundary } from './components/common/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* Router debe envolver la app */}
      <BrowserRouter>
        {/* AuthProvider envuelve la app para dar acceso al usuario en todos lados */}
        <AuthProvider>
          {/* SocketProvider envuelve la app para dar acceso al socket en todos lados */}
          <SocketProvider>
            <App />
            <Toaster position="bottom-right" toastOptions={{
              className: 'font-bold font-sans',
              style: {
                background: '#fff',
                color: '#333',
                border: '2px solid #000',
                borderRadius: '12px',
                boxShadow: '4px 4px 0px 0px #000'
              }
            }} />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);