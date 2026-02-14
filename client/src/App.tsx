import { AppRouter } from './routes/AppRouter';
import { ConfirmProvider } from './context/ConfirmContext';
import { GamificationLayer } from './components/layout/GamificationLayer';

function App() {
  return (
    // Ya no necesitamos <div className="..."> aquí, el Router maneja las vistas
    <ConfirmProvider>
      <GamificationLayer />
      <AppRouter />
    </ConfirmProvider>
  );
}

export default App;