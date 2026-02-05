import fs from 'fs';
import path from 'path';
import { Course, Unit, Lesson, Exercise, Deck, Flashcard } from '../models';
import sequelize from '../config/database';

const CONTENT_DIR = path.join(__dirname, '../../database/content');

const syncContent = async () => {
  try {
    // IMPORTANTE: No usamos sequelize.sync({ force: true }) aquí porque borraría todo.
    await sequelize.authenticate();
    console.log('📡 Conectado a la BD. Iniciando sincronización incremental...');

    const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(CONTENT_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`\n📦 Procesando archivo: ${file}`);

      // 1. CURSO (Busca por título)
      const [course, createdCourse] = await Course.findOrCreate({
        where: { title: data.title },
        defaults: {
          description: data.description,
          level: data.level,
          institution_target: data.institution_target,
          img_url: data.img_url
        }
      });
      console.log(`   ${createdCourse ? '✨ Creado' : '✅ Ya existe'}: Curso "${course.title}"`);

      // 2. UNIDADES
      if (data.units) {
        for (const unitData of data.units) {
          const [unit, createdUnit] = await Unit.findOrCreate({
            where: { title: unitData.title, course_id: course.id },
            defaults: {
              description: unitData.description,
              order_index: unitData.order_index
            }
          });
          if (createdUnit) console.log(`      + Unidad creada: ${unit.title}`);

          // 3. LECCIONES
          if (unitData.lessons) {
            for (const lessonData of unitData.lessons) {
              const [lesson, createdLesson] = await Lesson.findOrCreate({
                where: { title: lessonData.title, unit_id: unit.id },
                defaults: {
                  order_index: lessonData.order_index,
                  xp_reward: lessonData.xp_reward,
                  theory_content: lessonData.theory_content
                }
              });
              if (createdLesson) console.log(`         > Lección creada: ${lesson.title}`);

              // 4. EJERCICIOS (Incremental)
              if (lessonData.exercises) {
                let exCount = 0;
                for (const exData of lessonData.exercises) {
                  // Buscamos si ya existe este ejercicio específico en esta lección
                  const [ex, createdEx] = await Exercise.findOrCreate({
                    where: { 
                      lesson_id: lesson.id, 
                      prompt: exData.prompt // Usamos la pregunta como identificador único
                    },
                    defaults: {
                      type: exData.type,
                      difficulty: exData.difficulty,
                      options: exData.options,
                      correct_answer: exData.correct_answer,
                      solution_explanation: exData.solution_explanation
                    }
                  });
                  if (createdEx) exCount++;
                }
                if (exCount > 0) console.log(`            - ${exCount} nuevos ejercicios agregados.`);
              }
            }
          }

          // 5. MAZOS (Flashcards)
          if (unitData.decks) {
            for (const deckData of unitData.decks) {
              const [deck, createdDeck] = await Deck.findOrCreate({
                where: { name: deckData.name, unit_id: unit.id },
                defaults: {
                  description: deckData.description,
                  image_url: deckData.image_url,
                  active: true
                }
              });
              
              if (deckData.flashcards) {
                let cardCount = 0;
                for (const cardData of deckData.flashcards) {
                  const [card, createdCard] = await Flashcard.findOrCreate({
                    where: { deck_id: deck.id, front: cardData.front }, // Identificamos por el frente de la carta
                    defaults: {
                      back: cardData.back
                    }
                  });
                  if (createdCard) cardCount++;
                }
                if (cardCount > 0) console.log(`      🎴 ${cardCount} cartas nuevas en mazo "${deck.name}"`);
              }
            }
          }
        }
      }
    }

    console.log('\n🚀 Sincronización finalizada. Todo el contenido está al día.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error sincronizando contenido:', error);
    process.exit(1);
  }
};

syncContent();