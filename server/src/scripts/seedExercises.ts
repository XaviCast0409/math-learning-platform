// server/src/scripts/seedExercises.ts
import dotenv from 'dotenv';
dotenv.config(); 
import sequelize from '../config/database'; 
import { Exercise } from '../models';

const seed = async () => {
  try {
    console.log("🔌 Conectando a la base de datos...");
    await sequelize.authenticate();
    
    // Opcional: Sincronizar tabla exercises
    await Exercise.sync({ force: true }); 

    console.log("🌱 Sembrando Ejercicios...");

    const exercises = [
      {
        lesson_id: 1, // Asegúrate de que exista la lección 1
        type: 'multiple_choice',
        difficulty: 1,
        prompt: '¿Cuánto es $2^3$?',
        options: ["6", "8", "9", "4"],
        correct_answer: "8",
        solution_explanation: "El exponente indica cuántas veces se multiplica la base: $2 \\times 2 \\times 2 = 8$."
      },
      {
        lesson_id: 1,
        type: 'true_false',
        difficulty: 1,
        prompt: 'La expresión $5^0$ es igual a $0$.',
        options: ["Verdadero", "Falso"],
        correct_answer: "Falso",
        solution_explanation: "Cualquier número elevado a la 0 es 1. $5^0 = 1$."
      },
      {
        lesson_id: 1,
        type: 'fill_in',
        difficulty: 2,
        prompt: 'Calcula el resultado de: $3^2 + 4^0$',
        options: [],
        correct_answer: "10",
        solution_explanation: "$3^2 = 9$ y $4^0 = 1$. Entonces $9 + 1 = 10$."
      }
    ];

    // @ts-ignore
    await Exercise.bulkCreate(exercises);

    console.log("✅ Ejercicios creados con éxito");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
};

seed();