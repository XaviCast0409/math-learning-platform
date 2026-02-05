import { AppRouter } from './routes/AppRouter';

function App() {
  return (
    // Ya no necesitamos <div className="..."> aquí, el Router maneja las vistas
    <AppRouter />
  );
}

export default App;