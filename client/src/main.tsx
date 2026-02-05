import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Necesitamos el Router aquí
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // 👈 Importar
import { SocketProvider } from './context/SocketContext'; //

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Router debe envolver la app */}
    <BrowserRouter>
      {/* AuthProvider envuelve la app para dar acceso al usuario en todos lados */}
      <AuthProvider>
        {/* SocketProvider envuelve la app para dar acceso al socket en todos lados */}
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);