import User from '../../models/User';
import { calculateLevelFromXP } from '../../config/gamification.config';

export const fixAllUserLevels = async () => {
  console.log("🔄 Iniciando reparación de niveles...");
  
  const users = await User.findAll(); // Traemos todos los usuarios

  let count = 0;
  for (const user of users) {
    // Calculamos el nivel real basado en su XP actual
    const realLevel = calculateLevelFromXP(user.xp_total);

    // Si el nivel en BD es diferente al real, lo corregimos
    if (user.level !== realLevel) {
      user.level = realLevel;
      // Guardamos (esto dispara el update en la BD)
      await user.save({ hooks: false }); // hooks: false para guardar directo sin validar
      console.log(`✅ Usuario ${user.username}: Nivel corregido ${user.level} -> ${realLevel}`);
      count++;
    }
  }

  console.log(`✨ Reparación completada. ${count} usuarios actualizados.`);
};