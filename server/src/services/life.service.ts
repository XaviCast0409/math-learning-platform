import User from '../models/User'; 

const MAX_LIVES = 5;
const REGEN_MINUTES = 30; 
const MS_PER_LIFE = REGEN_MINUTES * 60 * 1000;

export class LifeService {
  
  /**
   * Sincroniza las vidas del usuario basado en el tiempo transcurrido.
   * Se debe llamar al hacer Login o al obtener el Perfil.
   */
  // 👇 Aceptamos 'any' temporalmente para manejar objetos planos que vienen del Auth
  static async syncLives(userInput: User | any) {
    
    // --- 🛡️ CORRECCIÓN DEL ERROR ---
    // Si 'userInput' no tiene la función .save, significa que es un JSON plano.
    // Lo recargamos de la base de datos para obtener la instancia real.
    let user = userInput;
    
    if (typeof user.save !== 'function') {
      // Buscamos al usuario real en la BD usando el ID
      const realUser = await User.findByPk(user.id);
      if (realUser) {
        user = realUser;
      } else {
        // Si no existe (raro), devolvemos lo que llegó sin tocar nada
        return { lives: user.lives || 0, nextRegen: null };
      }
    }
    // -------------------------------

    // 1. Si ya tiene las vidas al máximo, no hay nada que calcular.
    if (user.lives >= MAX_LIVES) {
      return { 
        lives: MAX_LIVES, 
        nextRegen: null 
      };
    }

    // 2. Si le faltan vidas pero no tiene fecha de referencia, la ponemos AHORA.
    if (!user.last_life_regen) {
      user.last_life_regen = new Date();
      await user.save(); // ✅ Ahora esto funcionará seguro
      return { 
        lives: user.lives, 
        nextRegen: new Date(user.last_life_regen.getTime() + MS_PER_LIFE) 
      };
    }

    // 3. CÁLCULO MATEMÁTICO 🧮
    const now = new Date();
    const lastRegen = new Date(user.last_life_regen);
    
    const timeDiff = now.getTime() - lastRegen.getTime();
    const livesGained = Math.floor(timeDiff / MS_PER_LIFE);

    if (livesGained > 0) {
      const newLives = Math.min(MAX_LIVES, user.lives + livesGained);
      
      user.lives = newLives;

      if (newLives >= MAX_LIVES) {
        // Lleno
      } else {
        // TRUCO CLAVE: Adelantamos el reloj solo lo consumido
        const timeConsumed = livesGained * MS_PER_LIFE;
        user.last_life_regen = new Date(lastRegen.getTime() + timeConsumed);
      }
      
      await user.save(); // ✅ Guardado seguro
    }

    // 4. Calcular cuándo llega la PRÓXIMA vida
    let nextRegen = null;
    if (user.lives < MAX_LIVES) {
      nextRegen = new Date(new Date(user.last_life_regen).getTime() + MS_PER_LIFE);
    }

    return {
      lives: user.lives,
      nextRegen 
    };
  }

  static async loseLife(userInput: User | any, amount: number = 1) {
    // --- 🛡️ MISMA CORRECCIÓN AQUÍ ---
    let user = userInput;
    if (typeof user.save !== 'function') {
        const realUser = await User.findByPk(user.id);
        if (realUser) user = realUser;
    }
    // -------------------------------

    const wasFull = user.lives === MAX_LIVES;
    
    user.lives = Math.max(0, user.lives - amount);

    if (wasFull && user.lives < MAX_LIVES) {
      user.last_life_regen = new Date(); 
    }
    
    await user.save();
    return user.lives;
  }
}