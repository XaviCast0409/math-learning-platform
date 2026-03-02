import sequelize from '../config/database';
import { User, Course, Unit, Lesson, Exercise } from '../models';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';

async function seedDatabase() {
  try {
    // 1. SINCRONIZACIÓN INICIAL SIN BORRAR TABLAS
    // Usamos alter: true para actualizar las tablas estructurálmente sin perder la data actual (usuarios, progreso, etc).
    await sequelize.sync({ alter: true });
    console.log('🔄 Base de datos sincronizada (sin borrar datos).');

    // 2. CREAR ÚNICAMENTE EL USUARIO ADMIN SI NO EXISTE
    const adminEmail = 'admin@xaviplay.com';
    const passwordHash = await bcrypt.hash('123456', 10);
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        username: 'XaviAdmin',
        password_hash: passwordHash,
        role: 'admin',
        full_name: 'Xavier Administrador',
        age: 30,
        phone: '987654321',
        grade_level: '5to_secundaria',
        email_verified: true,
        xp_total: 99999,
        gems: 50000,
        lives: 5,
        elo_rating: 2500,
        level: 99
      }
    });

    if (adminCreated) {
      console.log('👤 Usuario admin creado exitosamente.');
    } else {
      console.log('👤 Usuario admin ya existía. Mantenido.');
    }

    // 3. SEED DE CURSOS DESDE JSON (LÓGICA IDEMPOTENTE)
    const coursesDir = path.join(__dirname, 'data', 'courses');

    // Check if directory exists
    try {
      await fs.access(coursesDir);
    } catch {
      console.log('📦 Directorio de cursos no encontrado. Saltando la creación de cursos.');
      return;
    }

    const files = await fs.readdir(coursesDir);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(coursesDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const courseJson = JSON.parse(fileContent);

      console.log(`\n📚 Procesando curso: ${courseJson.title} (Archivo: ${file})`);

      // Normalizar nivel (fix bug secundario -> secundaria)
      let parsedLevel = courseJson.level || 'secundaria';
      if (parsedLevel === 'secundario') parsedLevel = 'secundaria';

      // Crear o actualizar Curso (buscando por title)
      const [courseRecord] = await Course.findOrCreate({
        where: { title: courseJson.title },
        defaults: {
          description: courseJson.description,
          level: parsedLevel,
          institution_target: courseJson.institution_target || 'General',
          img_url: courseJson.img_url || ''
        }
      });
      // Actualizamos siempre para reflejar los cambios en el JSON
      await courseRecord.update({
        description: courseJson.description,
        level: parsedLevel,
        institution_target: courseJson.institution_target || 'General',
        img_url: courseJson.img_url || ''
      });

      // Crear o actualizar Unidades
      if (courseJson.units && Array.isArray(courseJson.units)) {
        for (const unit of courseJson.units) {
          const [unitRecord] = await Unit.findOrCreate({
            where: { course_id: courseRecord.id, title: unit.title },
            defaults: {
              description: unit.description || '',
              order_index: unit.order_index || 1
            }
          });
          await unitRecord.update({
            description: unit.description || '',
            order_index: unit.order_index || 1
          });

          // Crear o actualizar Lecciones
          if (unit.lessons && Array.isArray(unit.lessons)) {
            for (const lesson of unit.lessons) {
              const [lessonRecord] = await Lesson.findOrCreate({
                where: { unit_id: unitRecord.id, title: lesson.title },
                defaults: {
                  order_index: lesson.order_index || 1,
                  xp_reward: lesson.xp_reward || 0,
                  theory_content: lesson.theory_content || ''
                }
              });
              await lessonRecord.update({
                order_index: lesson.order_index || 1,
                xp_reward: lesson.xp_reward || 0,
                theory_content: lesson.theory_content || ''
              });

              // Crear o actualizar Ejercicios
              if (lesson.exercises && Array.isArray(lesson.exercises)) {
                for (const exercise of lesson.exercises) {
                  // Asumimos que el prompt identifíca al ejercicio temporalmente dentro de la lección
                  const [exRecord] = await Exercise.findOrCreate({
                    where: { lesson_id: lessonRecord.id, prompt: exercise.prompt },
                    defaults: {
                      type: exercise.type || 'multiple_choice',
                      difficulty: exercise.difficulty || 1,
                      options: exercise.options || {},
                      correct_answer: exercise.correct_answer || '',
                      solution_explanation: exercise.solution_explanation || ''
                    }
                  });
                  await exRecord.update({
                    type: exercise.type || 'multiple_choice',
                    difficulty: exercise.difficulty || 1,
                    options: exercise.options || {},
                    correct_answer: exercise.correct_answer || '',
                    solution_explanation: exercise.solution_explanation || ''
                  });
                }
              }
            }
          }
        }
      }
      console.log(`✅ Curso ${courseJson.title} sincronizado correctamente.`);
    }

  } catch (error) {
    console.error('❌ Error crítico en el proceso de seed:', error);
  } finally {
    await sequelize.close();
    console.log('\n✅ Proceso de seed terminado.');
  }
}

seedDatabase();