import { AppRouter } from './routes/AppRouter';
import { ConfirmProvider } from './context/ConfirmContext';

function App() {
  return (
    // Ya no necesitamos <div className="..."> aquí, el Router maneja las vistas
    <ConfirmProvider>
      <AppRouter />
    </ConfirmProvider>
  );
}

export default App;