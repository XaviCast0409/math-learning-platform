import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-red-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>

                        <h1 className="text-2xl font-black text-gray-800 mb-2">¡Ups! Algo salió mal</h1>
                        <p className="text-gray-500 mb-6">
                            Ha ocurrido un error inesperado. Hemos registrado el problema para solucionarlo.
                        </p>

                        <div className="bg-gray-100 p-4 rounded-lg text-left text-xs font-mono text-gray-600 mb-6 overflow-auto max-h-32">
                            {this.state.error?.toString()}
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            icon={<RefreshCw size={18} />}
                            className="w-full"
                        >
                            Recargar Aplicación
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
