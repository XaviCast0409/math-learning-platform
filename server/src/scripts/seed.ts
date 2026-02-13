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
    // 2. USUARIOS
    // -------------------------------------------------------------------------
    // Admin
    await User.create({
      username: 'XaviAdmin',
      email: 'admin@xaviplay.com',
      password_hash: passwordHash,
      role: 'admin',
      xp_total: 99999,
      gems: 50000,
      lives: 5,
      elo_rating: 2500,
      level: 99
    });

    // Tú (Usuario Principal)
    await User.create({
      username: 'EstudiantePRO',
      email: 'yo@test.com',
      password_hash: passwordHash,
      role: 'student',
      level: 5,
      xp_total: 1200,
      gems: 500,
      lives: 5,
      elo_rating: 1000
    });

    // Rival
    await User.create({
      username: 'RivalDigno',
      email: 'rival1@test.com',
      password_hash: passwordHash,
      role: 'student',
      level: 6,
      xp_total: 1350,
      gems: 100,
      lives: 5,
      elo_rating: 1050
    });

    console.log('👤 Usuarios creados.');

    // -------------------------------------------------------------------------
    // 3. CURSO: ÁLGEBRA PRE-U
    // -------------------------------------------------------------------------
    const algebraCourse = await Course.create({
      title: 'Álgebra - Nivel Pre-Universitario',
      description: 'Domina los fundamentos para el examen de admisión.',
      level: 'pre_universitario',
      institution_target: 'General',
      img_url: 'https://cdn-icons-png.flaticon.com/512/3771/3771518.png'
    });

    // --- UNIDAD 1 ---
    const unit1 = await Unit.create({
      course_id: algebraCourse.id,
      title: 'Unidad 1: Leyes de Exponentes',
      order_index: 1,
      description: 'Potenciación y radicación en R.'
    });

    // LECCIÓN 1.1
    const lesson1_1 = await Lesson.create({
      unit_id: unit1.id,
      title: 'Potenciación Básica',
      order_index: 1,
      xp_reward: 50,
      theory_content: 'La potenciación es una operación que consiste en multiplicar un número llamado base tantas veces como indica otro número llamado exponente.Ejemplo: $$ 2^3 = 2 \\times 2 \\times 2 = 8 $$'
    });

    // Ejercicios 1.1 (CORREGIDO: difficulty es número)
    await Exercise.bulkCreate([
      {
        lesson_id: lesson1_1.id,
        type: 'multiple_choice',
        difficulty: 1, // Antes 'easy' -> Ahora 1
        prompt: 'Calcula el valor de: $$ 5^3 $$',
        options: { a: '15', b: '125', c: '25', d: '53' },
        correct_answer: 'b',
        solution_explanation: '$$ 5 \\times 5 \\times 5 = 125 $$'
      },
      {
        lesson_id: lesson1_1.id,
        type: 'true_false',
        difficulty: 1, // Antes 'easy' -> Ahora 1
        prompt: 'Todo número elevado a la 0 es siempre 1 (si la base no es 0).',
        options: { true: 'Verdadero', false: 'Falso' },
        correct_answer: 'true',
        solution_explanation: 'Correcto, $$ a^0 = 1 $$ para todo $$ a \\neq 0 $$.'
      },
      {
        lesson_id: lesson1_1.id,
        type: 'fill_in',
        difficulty: 2, // Antes 'medium' -> Ahora 2
        prompt: 'Si $$ 2^x = 32 $$, entonces $$ x $$ vale:',
        options: null,
        correct_answer: '5',
        solution_explanation: 'Porque $$ 2^5 = 32 $$.'
      }
    ]);

    // LECCIÓN 1.2
    const lesson1_2 = await Lesson.create({
      unit_id: unit1.id,
      title: 'Multiplicación de Bases Iguales',
      order_index: 2,
      xp_reward: 60,
      theory_content: 'Cuando multiplicamos bases iguales, los exponentes se suman: $$ a^m \\cdot a^n = a^{m+n} $$'
    });

    await Exercise.bulkCreate([
      {
        lesson_id: lesson1_2.id,
        type: 'multiple_choice',
        difficulty: 2, // Antes 'medium' -> Ahora 2
        prompt: 'Simplifica: $$ x^5 \\cdot x^3 $$',
        options: { a: 'x^15', b: 'x^8', c: '2x^8', d: 'x^2' },
        correct_answer: 'b',
        solution_explanation: 'Se suman exponentes: $$ 5 + 3 = 8 $$.'
      },
      {
        lesson_id: lesson1_2.id,
        type: 'multiple_choice',
        difficulty: 3, // Antes 'hard' -> Ahora 3
        prompt: 'Reducir: $$ \\frac{2^{n+4}}{2^{n+2}} $$',
        options: { a: '2', b: '4', c: '8', d: '1' },
        correct_answer: 'b',
        solution_explanation: 'Resta de exponentes: $$ (n+4) - (n+2) = 2 $$. Luego $$ 2^2 = 4 $$.'
      }
    ]);

    // --- UNIDAD 2 ---
    const unit2 = await Unit.create({
      course_id: algebraCourse.id,
      title: 'Unidad 2: Polinomios y Productos Notables',
      order_index: 2,
      description: 'Operaciones algebraicas fundamentales.'
    });

    // LECCIÓN 2.1
    const lesson2_1 = await Lesson.create({
      unit_id: unit2.id,
      title: 'Binomio al Cuadrado',
      order_index: 1,
      xp_reward: 100,
      theory_content: 'Recuerda: $$ (a+b)^2 = a^2 + 2ab + b^2 $$'
    });

    await Exercise.bulkCreate([
      {
        lesson_id: lesson2_1.id,
        type: 'multiple_choice',
        difficulty: 2, // Medium -> 2
        prompt: 'Desarrolla: $$ (x+3)^2 $$',
        options: { a: 'x^2 + 9', b: 'x^2 + 3x + 9', c: 'x^2 + 6x + 9', d: 'x^2 + 9x + 9' },
        correct_answer: 'c',
        solution_explanation: 'El doble del primero por el segundo es $$ 2(x)(3) = 6x $$.'
      }
    ]);

    console.log('📚 Curso y contenido creados.');

    // -------------------------------------------------------------------------
    // 4. TIENDA
    // -------------------------------------------------------------------------
    await Product.bulkCreate([
      { name: 'Poción de Salud', cost_gems: 50, category: 'instant', type: 'life_refill', image_url: '/assets/shop/heart.png', active: true, description: 'Rellena vidas.' },
      { name: 'XP Boost (30m)', cost_gems: 150, category: 'inventory', type: 'xp_boost_time', effect_metadata: { duration_minutes: 30 }, image_url: '/assets/shop/xp.png', active: true, description: 'Doble XP por 30m.' },
      { name: 'Gemas x2 (1h)', cost_gems: 200, category: 'inventory', type: 'gem_boost_time', effect_metadata: { duration_minutes: 60 }, image_url: '/assets/shop/gem.png', active: true, description: 'Doble Gemas por 1h.' },
      { name: 'Skin: Matemático', cost_gems: 500, category: 'cosmetic', type: 'avatar_skin', effect_metadata: { passive_bonus: { stat: 'xp', percent: 0.10 } }, image_url: '/assets/shop/skin.png', active: true, description: '+10% XP permanente.' },
      { name: 'Cupón Examen', cost_gems: 1000, category: 'inventory', type: 'real_world_reward', description: 'Canjéalo con tu profesor.', image_url: '/assets/shop/coupon.png', active: true }
    ]);

    console.log('🛒 Tienda creada.');

    // -------------------------------------------------------------------------
    // 5. MAZOS (Flashcards)
    // -------------------------------------------------------------------------

    // Mazo 1
    const deck1 = await Deck.create({
      unit_id: unit1.id,
      name: 'Memorización: Leyes de Exponentes',
      description: 'Repaso fundamental.',
      image_url: 'https://cdn-icons-png.flaticon.com/512/2641/2641469.png',
      active: true
    });

    await Flashcard.bulkCreate([
      { deck_id: deck1.id, front: 'Exponente Cero: $$ a^0 = ? $$', back: '$$ 1 $$ (Si $$ a \\neq 0 $$)' },
      { deck_id: deck1.id, front: 'Producto bases iguales: $$ a^m \\cdot a^n $$', back: '$$ a^{m+n} $$' },
      { deck_id: deck1.id, front: 'Exponente negativo: $$ a^{-n} $$', back: '$$ \\frac{1}{a^n} $$' }
    ]);

    // Mazo 2
    const deck2 = await Deck.create({
      unit_id: unit2.id,
      name: 'Productos Notables',
      description: 'Identidades clave.',
      image_url: 'https://cdn-icons-png.flaticon.com/512/897/897368.png',
      active: true
    });

    await Flashcard.bulkCreate([
      { deck_id: deck2.id, front: '$$ (a+b)^2 $$', back: '$$ a^2 + 2ab + b^2 $$' },
      { deck_id: deck2.id, front: 'Diferencia de Cuadrados', back: '$$ a^2 - b^2 = (a+b)(a-b) $$' }
    ]);

    console.log('✅ SEED COMPLETADO CORRECTAMENTE.');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();