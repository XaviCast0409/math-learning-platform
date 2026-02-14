import { rewardService } from './reward.service';
import { userService } from './user.service';
import { TowerRun, TowerHistory, User, Exercise, Lesson, Unit, Clan, UserItem, Product } from '../models';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import AppError from '../utils/AppError';

export class TowerService {

	/**
	 * Inicia una nueva run.
	 * Costo: 1 Ticket (Prioridad) O 250 Gemas.
	 */
	async startRun(userId: number) {
		const user = await User.findByPk(userId);
		if (!user) throw new AppError('Usuario no encontrado', 404);

		// 1. Verificar si ya tiene una run activa
		const activeRun = await TowerRun.findOne({
			where: { user_id: userId, is_active: true }
		});

		if (activeRun) {
			return activeRun;
		}

		// 2. Verificar Regeneración de Tickets (Diario)
		const now = new Date();
		const lastRegen = user.last_ticket_regen ? new Date(user.last_ticket_regen) : new Date(0);

		// Si ha pasado un día desde la última regen
		const isSameDay = now.getDate() === lastRegen.getDate() &&
			now.getMonth() === lastRegen.getMonth() &&
			now.getFullYear() === lastRegen.getFullYear();

		if (!isSameDay) {
			// Regenerar 1 ticket si tiene 0
			if (user.tower_tickets < 1) {
				user.tower_tickets = 1;
				user.last_ticket_regen = now;
				await user.save();
			}
		}

		// 3. Cobrar Entrada
		let costType = '';
		if (user.tower_tickets > 0) {
			user.tower_tickets -= 1;
			costType = 'Ticket Diario';
		} else if (user.gems >= 250) {
			user.gems -= 250;
			costType = '250 Gemas';
		} else {
			throw new AppError('No tienes suficientes tickets ni gemas (250) para entrar.', 403);
		}
		await user.save();

		// 4. Crear nueva run
		const newRun = await TowerRun.create({
			user_id: userId,
			current_floor: 1,
			lives_left: 3,
			is_active: true,
			score: 0,
			difficulty_modifier: 1.0
		});

		return { run: newRun, costType };
	}

	/**
	 * Obtiene el estado actual + la siguiente pregunta.
	 */
	async getStatus(userId: number) {
		const run = await TowerRun.findOne({
			where: { user_id: userId, is_active: true }
		});

		if (!run) return null;

		// Generar pregunta basada en el piso
		const question = await this.generateQuestion(run.current_floor);

		return { run, question };
	}

	/**
	 * Procesa la respuesta del usuario.
	 */
	async submitAnswer(userId: number, exerciseId: number, answer: string) {
		const run = await TowerRun.findOne({ where: { user_id: userId, is_active: true } });
		if (!run) throw new AppError('No hay partida activa', 404);

		const exercise = await Exercise.findByPk(exerciseId);
		if (!exercise) throw new AppError('Ejercicio no encontrado', 404);
		console.log(answer);
		console.log(exercise.correct_answer);

		let isCorrect = false;
		// Lógica simple de verificación strings (case insensitive trim)
		if (exercise.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase()) isCorrect = true;
		console.log(exercise.correct_answer.trim().toLowerCase());
		console.log(answer.trim().toLowerCase());
		console.log(isCorrect);

		if (isCorrect) {
			// AUMENTAR PISO
			run.current_floor += 1;
			run.score += 10 * run.current_floor; // Más piso, más puntos
			await run.save();

			return {
				correct: true,
				lives: run.lives_left,
				floor: run.current_floor
			};

		} else {
			// PERDER VIDA
			run.lives_left -= 1;

			if (run.lives_left <= 0) {
				// --- GAME OVER ---
				run.is_active = false;
				await run.save();

				// Calcular Recompensas Base
				const floorsCleared = run.current_floor;
				const baseXp = floorsCleared * 10;
				const baseXaviCoins = floorsCleared * 5;

				// Obtener Usuario COMPLETO para el servicio de recompensas
				// Optimizacion: Traemos todo en una query para no hacerla dentro del servicio
				const user = await User.findByPk(userId, {
					include: [
						{ model: Clan, as: 'clan' },
						{
							model: UserItem,
							as: 'user_items',
							where: { is_equipped: true },
							required: false, // Left join
							include: [{ model: Product, where: { category: 'cosmetic' } }]
						}
					]
				});

				if (user) {
					// Calcular Bonificaciones (Clan, Cosméticos, Pociones)
					// Pasamos el user ya cargado
					const { finalXp, finalXaviCoins, appliedBonuses } = await rewardService.calculateBonuses(userId, baseXp, baseXaviCoins, user);

					// Usamos userService para añadir XP y gestionar nivel
					const xpResult = await userService.addExperience(userId, finalXp);

					// Añadimos gemas manualmente (o podríamos moverlo a userService si quisiéramos centralizar todo)
					if (finalXaviCoins > 0) {
						xpResult.user.gems += finalXaviCoins;
						await xpResult.user.save();
					}

					// Guardar en historial
					await TowerHistory.create({
						user_id: userId,
						floor_reached: run.current_floor,
						score_achieved: run.score
					});

					// Construimos LevelRewardsPayload para el frontend
					const levelRewardsPayload = xpResult.leveledUp ? {
						...xpResult.rewards,
						previousLevel: xpResult.previousLevel,
						currentLevel: xpResult.currentLevel
					} : undefined;

					return {
						correct: false,
						gameOver: true,
						rewards: {
							xp: finalXp,
							gems: finalXaviCoins,
							floor: run.current_floor,
							score: run.score,
							bonuses: appliedBonuses
						},
						leveledUp: xpResult.leveledUp,
						levelRewards: levelRewardsPayload, // 👈 IMPORTANTE para el modal global
						newTotalXp: xpResult.user.xp_total, // Para actualizar contexto
						newTotalGems: xpResult.user.gems,   // Para actualizar contexto
						newLevel: xpResult.user.level       // Para actualizar contexto
					};
				}
			}

			await run.save(); // Guardar vida perdida si no es Game Over

			return {
				correct: false,
				lives: run.lives_left,
				floor: run.current_floor
			};
		}
	}

	// --- PRIVATE HELPERS ---

	private async generateQuestion(floor: number) {
		// Lógica de Dificultad:
		// Pisos 1-5: Easy
		// Pisos 6-10: Medium
		// Pisos 11+: Hard

		let difficultyTarget = 1;
		if (floor > 5) difficultyTarget = 2;
		if (floor > 10) difficultyTarget = 3;

		console.log(`[TowerService] Generating question for floor ${floor} (Difficulty: ${difficultyTarget})`);

		try {
			// Buscar ejercicio aleatorio de esa dificultad
			const exercise = await Exercise.findOne({
				where: { difficulty: difficultyTarget },
				order: sequelize.random(),
				include: [
					{
						model: Lesson,
						include: [{ model: Unit, as: 'unit', attributes: ['title'] }]
					}
				],
				logging: console.log // Ver la query en consola
			});

			if (exercise) {
				console.log(`[TowerService] Found exercise ID: ${exercise.id}`);
				return exercise;
			}

			console.warn(`[TowerService] No exercise found for difficulty ${difficultyTarget}. Trying fallback...`);

			// Fallback: Cualquier ejercicio
			const fallback = await Exercise.findOne({
				order: sequelize.random(),
				logging: console.log
			});

			if (fallback) {
				console.log(`[TowerService] Fallback exercise found ID: ${fallback.id}`);
				return fallback;
			}

			console.error('[TowerService] CRITICAL: No exercises in database!');
			return null; // Manejar esto en el controller

		} catch (error) {
			console.error('[TowerService] Error generating question:', error);
			throw error;
		}
	}
	/**
	 * Obtiene el ranking de mejores jugadores.
	 * Top 10 basado en Piso alcanzado (DESC) y Score (DESC).
	 */
	async getLeaderboard(limit: number = 10) {
		try {
			// Estrategia "Safety First":
			// 1. Traemos las mejores 50 runs (para tener margen de usuarios repetidos)
			// 2. Filtramos en memoria para dejar solo la mejor de cada usuario
			// 3. Cortamos al top 10

			const runs = await TowerHistory.findAll({
				attributes: ['id', 'user_id', 'floor_reached', 'score_achieved', 'ended_at'],
				include: [
					{
						model: User,
						attributes: ['username', 'metadata']
					}
				],
				order: [
					['floor_reached', 'DESC'],
					['score_achieved', 'DESC']
				],
				limit: 50 // Traemos extra para filtrar duplicados
			});

			// Deduplicar: Map<userId, Run>
			const uniqueRunsMap = new Map();

			for (const run of runs) {
				if (!uniqueRunsMap.has(run.user_id)) {
					uniqueRunsMap.set(run.user_id, run);
				}
				// Como vienen ordenados por mejor run, la primera que encontramos es la mejor
			}

			// Convertir a array y cortar a límite solicitado
			const leaderboard = Array.from(uniqueRunsMap.values())
				.slice(0, limit)
				.map((run: any) => ({
					id: run.id,
					user_id: run.user_id,
					floor_reached: run.floor_reached,
					score_achieved: run.score_achieved,
					ended_at: run.ended_at,
					User: run.User
				}));

			return leaderboard;

		} catch (error) {
			console.error('Error fetching leaderboard:', error);
			return [];
		}
	}
}

export const towerService = new TowerService();
