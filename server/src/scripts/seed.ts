import fs from 'fs';
import path from 'path';
import sequelize from '../config/database';
import { User, Course, Unit, Lesson, Exercise, Product, Deck, Flashcard } from '../models';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    // -------------------------------------------------------------------------
    // 1. LIMPIEZA Y CONFIGURACIÓN INICIAL
    // -------------------------------------------------------------------------
    await sequelize.sync({ force: true });
    console.log('🗑️  Base de datos limpiada y sincronizada.');

    const passwordHash = await bcrypt.hash('123456', 10);

    // -------------------------------------------------------------------------
    // 2. USUARIOS GLOBALES DE PRUEBA
    // -------------------------------------------------------------------------
    await User.create({
      username: 'XaviAdmin', email: 'admin@xaviplay.com', password_hash: passwordHash,
      role: 'admin', full_name: 'Xavier Administrador', age: 30, phone: '987654321',
      grade_level: '5to_secundaria', email_verified: true, xp_total: 99999, gems: 50000,
      lives: 5, elo_rating: 2500, level: 99
    });

    await User.create({
      username: 'EstudiantePRO', email: 'yo@test.com', password_hash: passwordHash,
      role: 'student', full_name: 'Juan Carlos Pérez', age: 16, phone: '912345678',
      grade_level: '5to_secundaria', email_verified: true, level: 5, xp_total: 1200,
      gems: 500, lives: 5, elo_rating: 1000
    });
    console.log('👤 Usuarios creados.');

    // -------------------------------------------------------------------------
    // 3. TIENDA BÁSICA
    // -------------------------------------------------------------------------
    await Product.bulkCreate([
      { name: 'Poción de Salud', cost_gems: 50, category: 'instant', type: 'life_refill', image_url: '/assets/shop/heart.png', active: true, description: 'Rellena vidas.' },
      { name: 'XP Boost (30m)', cost_gems: 150, category: 'inventory', type: 'xp_boost_time', effect_metadata: { duration_minutes: 30 }, image_url: '/assets/shop/xp.png', active: true, description: 'Doble XP por 30m.' },
      { name: 'Gemas x2 (1h)', cost_gems: 200, category: 'inventory', type: 'gem_boost_time', effect_metadata: { duration_minutes: 60 }, image_url: '/assets/shop/gem.png', active: true, description: 'Doble Gemas por 1h.' }
    ]);
    console.log('🛒 Tienda inicializada.');

    // -------------------------------------------------------------------------
    // 4. MIGRACIÓN MODULAR: LECTURA DE CURSOS DESDE JSON
    // -------------------------------------------------------------------------
    const coursesDir = path.join(__dirname, 'data', 'courses');

    if (fs.existsSync(coursesDir)) {
      const files = fs.readdirSync(coursesDir).filter(f => f.endsWith('.json'));
      console.log(`📂 Encontrados ${files.length} archivos de cursos JSON. Procesando...`);

      for (const file of files) {
        const filePath = path.join(coursesDir, file);
        const courseData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // TRUCO AVANZADO: Iniciamos una transacción.
        // O se sube TODO el curso perfecto sin errores, o no se sube NADA (Rollback).
        const transaction = await sequelize.transaction();

        try {
          // A. Crear Curso
          const course = await Course.create({
            title: courseData.title,
            description: courseData.description,
            level: courseData.level,
            institution_target: courseData.institution_target,
            img_url: courseData.img_url
          }, { transaction });

          // B. Procesar Unidades Secuencialmente
          if (courseData.units && Array.isArray(courseData.units)) {
            for (const unitData of courseData.units) {
              const unit = await Unit.create({
                course_id: course.id,
                title: unitData.title,
                order_index: unitData.order_index,
                description: unitData.description
              }, { transaction });

              // C. Procesar Lecciones y Ejercicios dentro de la Unidad
              if (unitData.lessons && Array.isArray(unitData.lessons)) {
                for (const lessonData of unitData.lessons) {
                  const lesson = await Lesson.create({
                    unit_id: unit.id,
                    title: lessonData.title,
                    order_index: lessonData.order_index,
                    xp_reward: lessonData.xp_reward,
                    theory_content: lessonData.theory_content
                  }, { transaction });

                  // Crear ejercicios con bulkCreate para mejor performance
                  if (lessonData.exercises && Array.isArray(lessonData.exercises)) {
                    const exercisesToInsert = lessonData.exercises.map((ex: any) => ({
                      ...ex,
                      lesson_id: lesson.id
                    }));
                    await Exercise.bulkCreate(exercisesToInsert, { transaction });
                  }
                }
              }

              // D. Procesar Decks de Flashcards de la Unidad (Memorización)
              if (unitData.decks && Array.isArray(unitData.decks)) {
                for (const deckData of unitData.decks) {
                  const deck = await Deck.create({
                    unit_id: unit.id,
                    name: deckData.name,
                    description: deckData.description,
                    image_url: deckData.image_url,
                    active: deckData.active
                  }, { transaction });

                  if (deckData.flashcards && Array.isArray(deckData.flashcards)) {
                    // Mapeo ágil para asociar clave foránea
                    const flashcardsToInsert = deckData.flashcards.map((fc: any) => ({
                      ...fc,
                      deck_id: deck.id
                    }));
                    await Flashcard.bulkCreate(flashcardsToInsert, { transaction });
                  }
                }
              }
            }
          }

          // Si llegamos hasta aquí, el JSON completo de este curso era válido
          await transaction.commit();
          console.log(`✅ Curso "${courseData.title}" [Cargado con Éxito]`);

        } catch (error) {
          // Si algo falla a mitad de curso, descartamos sus inserciones
          await transaction.rollback();
          console.error(`❌ Fallo crítico al procesar ${file}. Revirtiendo base de datos para este curso. Detalle:`, error);
        }
      }

    } else {
      console.log('⚠️ No se encontró la carpeta data/courses/. Crea la carpeta y coloca tus JSON.');
    }

    console.log('✅ SEED MODULAR COMPLETADO.');

  } catch (error) {
    console.error('❌ Error crítico en el proceso general de validación:', error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();