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
    });

    // Tú (Usuario Principal)
    await User.create({
      username: 'EstudiantePRO',
      email: 'yo@test.com',
      password_hash: passwordHash,
      role: 'student',
      full_name: 'Juan Carlos Pérez',
      age: 16,
      phone: '912345678',
      grade_level: '5to_secundaria',
      email_verified: true,
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
      full_name: 'María Fernanda López',
      age: 15,
      phone: '923456789',
      grade_level: '4to_secundaria',
      email_verified: true,
      level: 6,
      xp_total: 1350,
      gems: 100,
      lives: 5,
      elo_rating: 1050
    });

    // Estudiantes adicionales
    await User.create({
      username: 'MateGenius',
      email: 'genius@test.com',
      password_hash: passwordHash,
      role: 'student',
      full_name: 'Carlos Alberto Ramírez',
      age: 17,
      phone: '934567890',
      grade_level: '5to_secundaria',
      email_verified: true,
      level: 8,
      xp_total: 2400,
      gems: 800,
      lives: 5,
      elo_rating: 1200
    });

    await User.create({
      username: 'Principiante',
      email: 'newbie@test.com',
      password_hash: passwordHash,
      role: 'student',
      full_name: 'Ana Sofía Torres',
      age: 14,
      phone: '945678901',
      grade_level: '3ro_secundaria',
      email_verified: true,
      level: 2,
      xp_total: 300,
      gems: 50,
      lives: 5,
      elo_rating: 800
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
      theory_content: 'La potenciación es una operación que consiste en multiplicar un número llamado base tantas veces como indica otro número llamado exponente. Ejemplo: $$ 2^3 = 2 \\times 2 \\times 2 = 8 $$'
    });

    // Ejercicios 1.1
    await Exercise.bulkCreate([
      {
        lesson_id: lesson1_1.id,
        type: 'multiple_choice',
        difficulty: 1,
        prompt: 'Calcula el valor de: $$ 5^3 $$',
        options: { a: '15', b: '125', c: '25', d: '53' },
        correct_answer: 'b',
        solution_explanation: '$$ 5 \\times 5 \\times 5 = 125 $$'
      },
      {
        lesson_id: lesson1_1.id,
        type: 'true_false',
        difficulty: 1,
        prompt: 'Todo número elevado a la 0 es siempre 1 (si la base no es 0).',
        options: { true: 'Verdadero', false: 'Falso' },
        correct_answer: 'true',
        solution_explanation: 'Correcto, $$ a^0 = 1 $$ para todo $$ a \\neq 0 $$.'
      },
      {
        lesson_id: lesson1_1.id,
        type: 'fill_in',
        difficulty: 2,
        prompt: 'Si $$ 2^x = 32 $$, entonces $$ x $$ vale:',
        options: null,
        correct_answer: '5',
        solution_explanation: 'Porque $$ 2^5 = 32 $$.'
      },
      {
        lesson_id: lesson1_1.id,
        type: 'multiple_choice',
        difficulty: 1,
        prompt: 'Calcula: $$ 3^4 $$',
        options: { a: '12', b: '64', c: '81', d: '27' },
        correct_answer: 'c',
        solution_explanation: '$$ 3 \\times 3 \\times 3 \\times 3 = 81 $$'
      },
      {
        lesson_id: lesson1_1.id,
        type: 'multiple_choice',
        difficulty: 2,
        prompt: '¿Cuánto es $$ 10^0 + 10^1 + 10^2 $$?',
        options: { a: '111', b: '100', c: '110', d: '101' },
        correct_answer: 'a',
        solution_explanation: '$$ 1 + 10 + 100 = 111 $$'
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
        difficulty: 2,
        prompt: 'Simplifica: $$ x^5 \\cdot x^3 $$',
        options: { a: 'x^15', b: 'x^8', c: '2x^8', d: 'x^2' },
        correct_answer: 'b',
        solution_explanation: 'Se suman exponentes: $$ 5 + 3 = 8 $$.'
      },
      {
        lesson_id: lesson1_2.id,
        type: 'multiple_choice',
        difficulty: 3,
        prompt: 'Reducir: $$ \\frac{2^{n+4}}{2^{n+2}} $$',
        options: { a: '2', b: '4', c: '8', d: '1' },
        correct_answer: 'b',
        solution_explanation: 'Resta de exponentes: $$ (n+4) - (n+2) = 2 $$. Luego $$ 2^2 = 4 $$.'
      },
      {
        lesson_id: lesson1_2.id,
        type: 'fill_in',
        difficulty: 2,
        prompt: 'Simplifica: $$ a^7 \\cdot a^2 = a^? $$',
        options: null,
        correct_answer: '9',
        solution_explanation: 'Sumamos exponentes: $$ 7 + 2 = 9 $$'
      },
      {
        lesson_id: lesson1_2.id,
        type: 'multiple_choice',
        difficulty: 3,
        prompt: 'Calcula: $$ \\frac{5^8}{5^5} $$',
        options: { a: '5^3', b: '5^{13}', c: '125', d: 'a y c' },
        correct_answer: 'd',
        solution_explanation: '$$ 5^{8-5} = 5^3 = 125 $$'
      }
    ]);

    // LECCIÓN 1.3 (NUEVA)
    const lesson1_3 = await Lesson.create({
      unit_id: unit1.id,
      title: 'Exponentes Negativos',
      order_index: 3,
      xp_reward: 70,
      theory_content: 'Un exponente negativo indica el recíproco: $$ a^{-n} = \\frac{1}{a^n} $$'
    });

    await Exercise.bulkCreate([
      {
        lesson_id: lesson1_3.id,
        type: 'multiple_choice',
        difficulty: 2,
        prompt: 'Calcula: $$ 2^{-3} $$',
        options: { a: '-8', b: '1/8', c: '-1/8', d: '8' },
        correct_answer: 'b',
        solution_explanation: '$$ 2^{-3} = \\frac{1}{2^3} = \\frac{1}{8} $$'
      },
      {
        lesson_id: lesson1_3.id,
        type: 'fill_in',
        difficulty: 3,
        prompt: 'Simplifica: $$ \\frac{x^{-4}}{x^{-7}} = x^? $$',
        options: null,
        correct_answer: '3',
        solution_explanation: '$$ x^{-4-(-7)} = x^{-4+7} = x^3 $$'
      },
      {
        lesson_id: lesson1_3.id,
        type: 'true_false',
        difficulty: 2,
        prompt: '$$ 5^{-2} = -25 $$',
        options: { true: 'Verdadero', false: 'Falso' },
        correct_answer: 'false',
        solution_explanation: 'Falso. $$ 5^{-2} = \\frac{1}{25} $$, no es negativo.'
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
      theory_content: 'Recuerda: $$ (a+b)^2 = a^2 + 2ab + b^2 $$ y $$ (a-b)^2 = a^2 - 2ab + b^2 $$'
    });

    await Exercise.bulkCreate([
      {
        lesson_id: lesson2_1.id,
        type: 'multiple_choice',
        difficulty: 2,
        prompt: 'Desarrolla: $$ (x+3)^2 $$',
        options: { a: 'x^2 + 9', b: 'x^2 + 3x + 9', c: 'x^2 + 6x + 9', d: 'x^2 + 9x + 9' },
        correct_answer: 'c',
        solution_explanation: 'El doble del primero por el segundo es $$ 2(x)(3) = 6x $$.'
      },
      {
        lesson_id: lesson2_1.id,
        type: 'multiple_choice',
        difficulty: 2,
        prompt: 'Desarrolla: $$ (2x-5)^2 $$',
        options: { a: '4x^2 - 25', b: '4x^2 - 20x + 25', c: '2x^2 - 10x + 25', d: '4x^2 + 25' },
        correct_answer: 'b',
        solution_explanation: '$$ (2x)^2 - 2(2x)(5) + 5^2 = 4x^2 - 20x + 25 $$'
      },
      {
        lesson_id: lesson2_1.id,
        type: 'fill_in',
        difficulty: 3,
        prompt: 'Si $$ (x+k)^2 = x^2 + 10x + 25 $$, entonces $$ k = ? $$',
        options: null,
        correct_answer: '5',
        solution_explanation: '$$ 2k = 10 $$, entonces $$ k = 5 $$'
      }
    ]);

    // LECCIÓN 2.2 (NUEVA)
    const lesson2_2 = await Lesson.create({
      unit_id: unit2.id,
      title: 'Diferencia de Cuadrados',
      order_index: 2,
      xp_reward: 80,
      theory_content: 'Identidad fundamental: $$ a^2 - b^2 = (a+b)(a-b) $$'
    });

    await Exercise.bulkCreate([
      {
        lesson_id: lesson2_2.id,
        type: 'multiple_choice',
        difficulty: 2,
        prompt: 'Factoriza: $$ x^2 - 16 $$',
        options: { a: '(x-4)^2', b: '(x+4)(x-4)', c: '(x-8)(x+2)', d: 'No se puede' },
        correct_answer: 'b',
        solution_explanation: '$$ x^2 - 4^2 = (x+4)(x-4) $$'
      },
      {
        lesson_id: lesson2_2.id,
        type: 'multiple_choice',
        difficulty: 3,
        prompt: 'Simplifica: $$ \\frac{9x^2 - 25}{3x + 5} $$',
        options: { a: '3x - 5', b: '3x + 5', c: '6x', d: '9x - 25' },
        correct_answer: 'a',
        solution_explanation: '$$ \\frac{(3x)^2 - 5^2}{3x+5} = \\frac{(3x+5)(3x-5)}{3x+5} = 3x-5 $$'
      },
      {
        lesson_id: lesson2_2.id,
        type: 'fill_in',
        difficulty: 2,
        prompt: 'Factoriza: $$ 4a^2 - 1 = (2a + ?)(2a - ?) $$',
        options: null,
        correct_answer: '1',
        solution_explanation: '$$ (2a)^2 - 1^2 = (2a+1)(2a-1) $$'
      }
    ]);

    // LECCIÓN 2.3 (NUEVA)
    const lesson2_3 = await Lesson.create({
      unit_id: unit2.id,
      title: 'Suma y Diferencia de Cubos',
      order_index: 3,
      xp_reward: 120,
      theory_content: 'Fórmulas: $$ a^3 + b^3 = (a+b)(a^2 - ab + b^2) $$ y $$ a^3 - b^3 = (a-b)(a^2 + ab + b^2) $$'
    });

    await Exercise.bulkCreate([
      {
        lesson_id: lesson2_3.id,
        type: 'multiple_choice',
        difficulty: 3,
        prompt: 'Factoriza: $$ x^3 + 8 $$',
        options: { a: '(x+2)(x^2 - 2x + 4)', b: '(x+2)^3', c: '(x+2)(x^2 + 4)', d: 'No se puede' },
        correct_answer: 'a',
        solution_explanation: '$$ x^3 + 2^3 = (x+2)(x^2 - 2x + 4) $$'
      },
      {
        lesson_id: lesson2_3.id,
        type: 'multiple_choice',
        difficulty: 3,
        prompt: 'Factoriza: $$ 27 - y^3 $$',
        options: { a: '(3-y)(9+3y+y^2)', b: '(3-y)^3', c: '(3+y)(9-y^2)', d: '(3-y)(9-y^2)' },
        correct_answer: 'a',
        solution_explanation: '$$ 3^3 - y^3 = (3-y)(9 + 3y + y^2) $$'
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
      { deck_id: deck1.id, front: 'Exponente negativo: $$ a^{-n} $$', back: '$$ \\frac{1}{a^n} $$' },
      { deck_id: deck1.id, front: 'División bases iguales: $$ \\frac{a^m}{a^n} $$', back: '$$ a^{m-n} $$' },
      { deck_id: deck1.id, front: 'Potencia de potencia: $$ (a^m)^n $$', back: '$$ a^{m \\cdot n} $$' },
      { deck_id: deck1.id, front: '$$ x^5 \\cdot x^3 $$', back: '$$ x^8 $$' },
      { deck_id: deck1.id, front: '$$ \\frac{x^{10}}{x^2} $$', back: '$$ x^8 $$' },
      { deck_id: deck1.id, front: '$$ (x^2)^3 $$', back: '$$ x^6 $$' },
      { deck_id: deck1.id, front: '$$ 2^3 \\cdot 2^2 $$', back: '$$ 2^5 = 32 $$' },
      { deck_id: deck1.id, front: '$$ 5^0 + 3^0 $$', back: '$$ 2 $$' },
      { deck_id: deck1.id, front: '$$ (abc)^n $$', back: '$$ a^n b^n c^n $$' },
      { deck_id: deck1.id, front: '$$ \\left(\\frac{a}{b}\\right)^n $$', back: '$$ \\frac{a^n}{b^n} $$' },
      { deck_id: deck1.id, front: '$$ x^{-1} $$', back: '$$ \\frac{1}{x} $$' },
      { deck_id: deck1.id, front: '$$ \\frac{1}{x^{-2}} $$', back: '$$ x^2 $$' },
      { deck_id: deck1.id, front: '$$ (2x)^3 $$', back: '$$ 8x^3 $$' },
      { deck_id: deck1.id, front: '$$ (-2)^3 $$', back: '$$ -8 $$' },
      { deck_id: deck1.id, front: '$$ (-2)^4 $$', back: '$$ 16 $$' },
      { deck_id: deck1.id, front: '$$ -2^4 $$', back: '$$ -16 $$' },
      { deck_id: deck1.id, front: '$$ \\sqrt{x^2} $$', back: '$$ |x| $$' },
      { deck_id: deck1.id, front: '$$ x^{1/2} $$', back: '$$ \\sqrt{x} $$' },
      { deck_id: deck1.id, front: '$$ 2x^0 $$', back: '$$ 2 $$' },
      { deck_id: deck1.id, front: '$$ (2x)^0 $$', back: '$$ 1 $$' },
      { deck_id: deck1.id, front: '$$ x^a \\cdot x^{-a} $$', back: '$$ x^0 = 1 $$' },
      { deck_id: deck1.id, front: '$$ \\frac{x^5}{x^{-2}} $$', back: '$$ x^7 $$' },
      { deck_id: deck1.id, front: '$$ (x^{-2})^{-3} $$', back: '$$ x^6 $$' },
      { deck_id: deck1.id, front: '$$ \\left(\\frac{2}{3}\\right)^{-1} $$', back: '$$ \\frac{3}{2} $$' },
      { deck_id: deck1.id, front: '$$ 10^{-1} $$', back: '$$ 0.1 $$' },
      { deck_id: deck1.id, front: '$$ 10^{-2} $$', back: '$$ 0.01 $$' },
      { deck_id: deck1.id, front: '$$ \\frac{x^m}{x^m} $$', back: '$$ 1 $$' },
      { deck_id: deck1.id, front: '$$ a^{m/n} $$', back: '$$ \\sqrt[n]{a^m} $$' }
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
      { deck_id: deck2.id, front: 'Diferencia de Cuadrados', back: '$$ a^2 - b^2 = (a+b)(a-b) $$' },
      { deck_id: deck2.id, front: '$$ (a-b)^2 $$', back: '$$ a^2 - 2ab + b^2 $$' },
      { deck_id: deck2.id, front: 'Suma de Cubos', back: '$$ a^3 + b^3 = (a+b)(a^2 - ab + b^2) $$' },
      { deck_id: deck2.id, front: 'Diferencia de Cubos', back: '$$ a^3 - b^3 = (a-b)(a^2 + ab + b^2) $$' },
      { deck_id: deck2.id, front: '$$ (x+1)^2 $$', back: '$$ x^2 + 2x + 1 $$' },
      { deck_id: deck2.id, front: '$$ (x-1)^2 $$', back: '$$ x^2 - 2x + 1 $$' },
      { deck_id: deck2.id, front: '$$ (x+2)(x-2) $$', back: '$$ x^2 - 4 $$' },
      { deck_id: deck2.id, front: '$$ (x+y)^3 $$', back: '$$ x^3 + 3x^2y + 3xy^2 + y^3 $$' },
      { deck_id: deck2.id, front: '$$ (x-y)^3 $$', back: '$$ x^3 - 3x^2y + 3xy^2 - y^3 $$' },
      { deck_id: deck2.id, front: '$$ (x+a)(x+b) $$', back: '$$ x^2 + (a+b)x + ab $$' },
      { deck_id: deck2.id, front: '$$ (x+2)(x+3) $$', back: '$$ x^2 + 5x + 6 $$' },
      { deck_id: deck2.id, front: '$$ (x-5)(x+5) $$', back: '$$ x^2 - 25 $$' },
      { deck_id: deck2.id, front: '$$ (2x+3)^2 $$', back: '$$ 4x^2 + 12x + 9 $$' },
      { deck_id: deck2.id, front: '$$ (3x-1)^2 $$', back: '$$ 9x^2 - 6x + 1 $$' },
      { deck_id: deck2.id, front: 'Binomio al Cubo (suma)', back: '$$ a^3 + 3a^2b + 3ab^2 + b^3 $$' },
      { deck_id: deck2.id, front: 'Binomio al Cubo (resta)', back: '$$ a^3 - 3a^2b + 3ab^2 - b^3 $$' },
      { deck_id: deck2.id, front: 'Identidad de Legendre (+)', back: '$$ (a+b)^2 + (a-b)^2 = 2(a^2+b^2) $$' },
      { deck_id: deck2.id, front: 'Identidad de Legendre (-)', back: '$$ (a+b)^2 - (a-b)^2 = 4ab $$' },
      { deck_id: deck2.id, front: '$$ (x+1)(x^2-x+1) $$', back: '$$ x^3 + 1 $$' },
      { deck_id: deck2.id, front: '$$ (x-2)(x^2+2x+4) $$', back: '$$ x^3 - 8 $$' },
      { deck_id: deck2.id, front: 'Trinomio al cuadrado', back: '$$ a^2+b^2+c^2+2ab+2bc+2ac $$' },
      { deck_id: deck2.id, front: '$$ (a+b+c)^2 $$', back: '$$ a^2+b^2+c^2+2(ab+bc+ac) $$' },
      { deck_id: deck2.id, front: '$$ (x^2+y^2)(x^2-y^2) $$', back: '$$ x^4 - y^4 $$' },
      { deck_id: deck2.id, front: '$$ (x+1)(x-1)(x^2+1) $$', back: '$$ x^4 - 1 $$' }
    ]);

    // Mazo 3 (NUEVO)
    const deck3 = await Deck.create({
      unit_id: unit1.id,
      name: 'Radicación y Ecuaciones',
      description: 'Propiedades de raíces.',
      image_url: 'https://cdn-icons-png.flaticon.com/512/4359/4359784.png',
      active: true
    });

    await Flashcard.bulkCreate([
      { deck_id: deck3.id, front: '$$ \\sqrt{x y} $$', back: '$$ \\sqrt{x} \\sqrt{y} $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt{\\frac{x}{y}} $$', back: '$$ \\frac{\\sqrt{x}}{\\sqrt{y}} $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt[n]{x^m} $$', back: '$$ x^{m/n} $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt[n]{\\sqrt[m]{x}} $$', back: '$$ \\sqrt[nm]{x} $$' },
      { deck_id: deck3.id, front: '$$ (\\sqrt{x})^2 $$', back: '$$ x $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt{x^2} $$', back: '$$ |x| $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt{4} $$', back: '$$ 2 $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt{9} $$', back: '$$ 3 $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt{16} $$', back: '$$ 4 $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt[3]{8} $$', back: '$$ 2 $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt[3]{27} $$', back: '$$ 3 $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt[3]{-8} $$', back: '$$ -2 $$' },
      { deck_id: deck3.id, front: '$$ 8^{1/3} $$', back: '$$ 2 $$' },
      { deck_id: deck3.id, front: '$$ 16^{1/2} $$', back: '$$ 4 $$' },
      { deck_id: deck3.id, front: '$$ 16^{1/4} $$', back: '$$ 2 $$' },
      { deck_id: deck3.id, front: '$$ 32^{1/5} $$', back: '$$ 2 $$' },
      { deck_id: deck3.id, front: '$$ x^2 = 9 $$', back: '$$ x = \\pm 3 $$' },
      { deck_id: deck3.id, front: '$$ x^3 = 8 $$', back: '$$ x = 2 $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt{x} = 5 $$', back: '$$ x = 25 $$' },
      { deck_id: deck3.id, front: '$$ \\sqrt[3]{x} = 3 $$', back: '$$ x = 27 $$' }
    ]);

    console.log('🃏 Mazos de flashcards creados.');
    console.log('✅ SEED COMPLETADO CORRECTAMENTE.');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();