import axiosClient from '../../../api/axiosClient'; // Asegúrate de importar tu instancia configurada de Axios
import type { RaidBossData } from '../../../types/raid.types'; // Importa tus tipos

// Definimos la respuesta esperada del endpoint 'current'
interface CurrentRaidResponse {
  active: boolean;
  boss?: RaidBossData;
  message?: string;
}

// Definimos el payload para crear un boss (Admin)
interface SpawnRaidPayload {
  name: string;
  hp: number;
  duration: number; // en horas
  image?: string;
}

export const raidApi = {
  /**
   * Obtiene el estado del Raid actual.
   * Ruta: GET /api/raids/current
   */
  getCurrentBoss: async (): Promise<CurrentRaidResponse> => {
    // Axios ya está configurado con la baseURL '/api', así que solo ponemos '/raids/current'
    const { data } = await axiosClient.get<CurrentRaidResponse>('/raids/current');
    return data;
  },

  /**
   * (ADMIN) Crea un nuevo evento de Raid.
   * Ruta: POST /api/raids/spawn
   */
  spawnBoss: async (payload: SpawnRaidPayload) => {
    const { data } = await axiosClient.post('/raids/spawn', payload);
    return data;
  },

  /**
   * (Opcional - Debug) Atacar manualmente si decidiste dejar la ruta de prueba.
   * Ruta: POST /api/raids/attack
   * NOTA: Recuerda que en producción el ataque lo hace el socket o el controlador de lecciones.
   */
  // manualAttack: async (damage: number) => {
  //   const { data } = await api.post('/raids/attack', { damage });
  //   return data;
  // }
};