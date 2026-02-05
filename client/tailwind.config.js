/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Nuestra Paleta de Colores Retro/Pop
      colors: {
        brand: {
          yellow: '#FFD028', // Acción Principal
          yellowHover: '#E5B800',
          blue: '#4F46E5',   // Acentos / Primario
          dark: '#1A1A1A',   // Texto / Bordes
          light: '#F0F4F8',  // Fondos
          red: '#EF4444',    // Errores
          green: '#22C55E'   // Éxito
        }
      },
      // 2. Nuestra Sombra Dura Característica
      boxShadow: {
        'retro': '4px 4px 0px 0px rgba(0,0,0,1)',      // Estado normal
        'retro-sm': '2px 2px 0px 0px rgba(0,0,0,1)',   // Estado presionado (active)
      },
      // 3. Bordes
      borderWidth: {
        '3': '3px', // A veces 2 es muy poco y 4 es mucho
      }
    },
  },
  plugins: [],
}