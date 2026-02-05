import { Exercise, Match } from '../models';
import sequelize from '../config/database';

export class GameLogic {

  /**
   * 1. OBTENER PREGUNTAS ALEATORIAS
   */
  static async fetchRandomQuestions(limit = 5) {
    try {
      const questions = await Exercise.findAll({
        where: {
          type: ['multiple_choice', 'true_false'] 
        },
        order: sequelize.random(), 
        limit: limit,
        attributes: ['id', 'prompt', 'options', 'correct_answer', 'solution_explanation', 'difficulty']
      });

      return questions.map(q => q.toJSON());
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }

  /**
   * 2. LIMPIAR PREGUNTAS (ANTI-TRAMPAS)
   */
  static sanitizeForClient(questions: any[]) {
    return questions.map(q => {
        // Aseguramos que options se envíe bien formateado
        let options = q.options;
        // Si por alguna razón llega como string desde la BD, lo parseamos
        if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch(e) { options = []; }
        }

        return {
            id: q.id,
            prompt: q.prompt,
            options: options, 
            difficulty: q.difficulty,
        };
    });
  }

  /**
   * 3. VERIFICAR RESPUESTA (MEJORADO) 🧠
   * Ahora es inteligente: compara tanto el valor directo como la búsqueda por clave.
   */
  static checkAnswer(questionId: number, userAnswer: string, matchData: any[]): boolean {
    const question = matchData.find((q: any) => q.id === questionId);
    if (!question) return false;
    
    const correctRaw = String(question.correct_answer).trim().toLowerCase();
    const userRaw = String(userAnswer).trim().toLowerCase();

    // CASO 1: Comparación directa 
    // (Útil para 'fill_in' o si en el futuro guardas el valor '125' directamente)
    if (correctRaw === userRaw) return true;

    // CASO 2: Comparación por Clave/Key
    // (Útil para tu Seed actual: respuesta='b', usuario='125')
    if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
       // Buscamos el valor real que corresponde a la letra correcta (ej: options['b'])
       const valueFromKey = question.options[question.correct_answer];
       
       // Si existe ese valor y coincide con lo que mandó el usuario ('125' === '125')
       if (valueFromKey && String(valueFromKey).trim().toLowerCase() === userRaw) {
           return true;
       }
    }

    return false;
  }

  /**
   * 4. CALCULAR CAMBIO DE ELO
   */
  static calculateEloChange(winnerElo: number, loserElo: number, kFactor = 32): number {
    const expectedScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const change = Math.round(kFactor * (1 - expectedScore));
    return Math.max(1, change);
  }
}