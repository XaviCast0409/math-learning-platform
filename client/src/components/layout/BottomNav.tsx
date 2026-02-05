import { Map, BookOpen, User, ShoppingBag, Swords, Shield } from 'lucide-react'; // 👈 Agregamos Shield
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

export const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: Map, label: 'Aprender', to: '/learn' },
    { icon: BookOpen, label: 'Estudiar', to: '/study' },
    { icon: Swords, label: 'Jugar', to: '/pvp' },
    // 👇 NUEVA OPCIÓN: CLAN
    // La colocamos en el centro o cerca de "Jugar" por ser social/competitivo
    { icon: Shield, label: 'Clan', to: '/clan' }, 
    { icon: ShoppingBag, label: 'Tienda', to: '/shop' },
    { icon: User, label: 'Perfil', to: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe z-50">
      {/* NOTA DE DISEÑO:
         Al tener 6 elementos, cambiamos px-2 a px-1 y usamos justify-between o between 
         para asegurar que quepan en móviles pequeños (iPhone SE, etc).
      */}
      <div className="max-w-md mx-auto flex justify-between items-center h-16 px-1">
        {navItems.map((item) => {
          // Lógica para mantener activo también en sub-rutas (ej: /clan/create, /clan/war)
          const isActive = path.startsWith(item.to);
          
          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center justify-center w-full h-full gap-0.5 active:scale-95 transition-transform"
            >
              <item.icon
                size={24} // Puedes bajar a 22 si sientes que quedan muy juntos
                className={clsx(
                  "transition-colors duration-200",
                  isActive ? "text-brand-blue fill-current" : "text-gray-400"
                )}
                // Rellenamos el ícono si está activo para darle peso visual
                fill={isActive && item.icon !== Swords ? "currentColor" : "none"} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={clsx(
                "text-[10px] font-bold uppercase tracking-wide truncate max-w-[60px]", // truncate por seguridad
                isActive ? "text-brand-blue" : "text-gray-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};