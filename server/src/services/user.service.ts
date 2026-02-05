// src/services/user.service.ts
import { User, Clan } from '../models'; // Import User and Clan models
import { calculateLevelFromXP, calculateXpForLevel, LEVEL_REWARDS, MAX_LEVEL } from '../config/gamification.config';
// 👇 Import the centralized RewardService and ClanService
import { RewardService } from './reward.service';
import { ClanService } from './clan.service';

interface XpGainResult {
	user: User;
	leveledUp: boolean;
	levelsGained: number;
	rewards: {
		gems: number;
		lives: number;
		items: string[];
		bonusesApplied?: string[]; // To show bonuses in frontend
	};
}

const STREAK_MILESTONES: Record<number, { xp: number; gems: number; message: string }> = {
	3: { xp: 50, gems: 5, message: "¡Racha de 3 días!" },
	5: { xp: 100, gems: 10, message: "¡5 días seguidos! Eres constante." },
	7: { xp: 150, gems: 15, message: "¡Una semana perfecta!" },
	10: { xp: 200, gems: 20, message: "¡10 días de aprendizaje imparable!" },
	15: { xp: 300, gems: 30, message: "¡Medio mes sin fallar!" },
	30: { xp: 1000, gems: 100, message: "¡MES PERFECTO! Eres una leyenda." },
};

export class UserService {

	/**
	 * Adds XP, calculates level, grants rewards, and updates Clan XP.
	 */
	static async addExperience(userId: number, xpAmount: number): Promise<XpGainResult> {
		const user = await User.findByPk(userId);
		if (!user) throw new Error('Usuario no encontrado');

		const previousLevel = user.level;

		// 👇 1. CENTRALIZED CALCULATION (RewardService)
		// Delegate to RewardService to apply potions/items to the base XP
		const { finalXp, appliedBonuses } = await RewardService.calculateBonuses(
			userId,
			xpAmount,
			0 // 0 gems in this specific action (XP only)
		);

		// 2. Add Final XP to User
		user.xp_total += finalXp;

		// 👇 3. CLAN XP LOGIC (Option 2: Cooperative)
		// If the user is in a clan, add the same final XP to the clan
		if (user.clan_id) {
			// Use "fire and forget" (don't await) to keep user response fast,
			// or await it if you want strict consistency.
			ClanService.addClanXp(user.clan_id, finalXp).catch(err =>
				console.error(`[UserService] Error adding Clan XP: ${err.message}`)
			);
		}

		// 4. Calculate New Level
		const newLevel = calculateLevelFromXP(user.xp_total);

		// Accumulator for rewards
		const totalRewards = {
			gems: 0,
			lives: 0,
			items: [] as string[],
			bonusesApplied: appliedBonuses
		};

		// 5. Check for Level Up
		if (newLevel > previousLevel) {

			for (let i = previousLevel + 1; i <= newLevel; i++) {
				const reward = LEVEL_REWARDS[i];
				if (reward) {
					if (reward.gems) totalRewards.gems += reward.gems;
					if (reward.lives) totalRewards.lives += reward.lives;

					if (reward.item) {
						totalRewards.items.push(reward.item);
						const currentMeta = user.metadata as any || {};
						const inventory = currentMeta.unlocked_items || [];
						if (!inventory.includes(reward.item)) {
							inventory.push(reward.item);
						}
						user.metadata = { ...currentMeta, unlocked_items: inventory };
					}
				}
			}

			// Apply Level Up Rewards
			user.gems += totalRewards.gems;

			if (totalRewards.lives > 0) {
				user.lives += totalRewards.lives;
			} else {
				user.lives = 5;
			}

			user.level = newLevel;
		}

		await user.save();

		return {
			user,
			leveledUp: newLevel > previousLevel,
			levelsGained: newLevel - previousLevel,
			rewards: totalRewards
		};
	}

	static getProgressInfo(user: User) {
		const currentLevelXp = calculateXpForLevel(user.level);
		const nextLevelXp = calculateXpForLevel(user.level + 1);

		const progressXp = user.xp_total - currentLevelXp;
		const requiredXp = nextLevelXp - currentLevelXp;

		const percent = requiredXp > 0 ? Math.min(100, Math.max(0, (progressXp / requiredXp) * 100)) : 100;

		return {
			currentLevel: user.level,
			nextLevel: user.level + 1,
			currentXp: user.xp_total,
			xpForNextLevel: nextLevelXp,
			percent: Math.round(percent),
			isMaxLevel: user.level >= MAX_LEVEL
		};
	}

	/**
	 * Logic to calculate and update daily streak
	 */
	static async updateStreak(user: User) {
		const today = new Date();
		const lastActivity = user.last_activity_date ? new Date(user.last_activity_date) : null;

		let rewardEarned = null;

		if (!lastActivity) {
			user.current_streak = 1;
			user.highest_streak = 1;
			user.last_activity_date = today;
			await user.save();
			return { user, reward: null };
		}

		const todayMidnight = new Date(today);
		todayMidnight.setHours(0, 0, 0, 0);

		const lastMidnight = new Date(lastActivity);
		lastMidnight.setHours(0, 0, 0, 0);

		const diffTime = Math.abs(todayMidnight.getTime() - lastMidnight.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			if (user.current_streak === 0) {
				user.current_streak = 1;
				user.highest_streak = 1;
			}
			user.last_activity_date = today;
		}
		else if (diffDays === 1) {
			// Streak continues
			user.current_streak += 1;

			if (user.current_streak > user.highest_streak) {
				user.highest_streak = user.current_streak;
			}

			// Check Milestones
			const milestone = STREAK_MILESTONES[user.current_streak];
			if (milestone) {
				// 👇 CENTRALIZED CALCULATION (RewardService)
				// Apply bonuses to streak rewards too!
				const { finalXp, finalGems, appliedBonuses } = await RewardService.calculateBonuses(
					user.id,
					milestone.xp,
					milestone.gems
				);

				user.xp_total += finalXp;
				user.gems += finalGems;

				// Update Clan XP
				if (user.clan_id) {
					ClanService.addClanXp(user.clan_id, finalXp).catch(console.error);
				}

				rewardEarned = {
					streak: user.current_streak,
					xp: finalXp,         // Return final value
					gems: finalGems,     // Return final value
					message: milestone.message,
					bonuses: appliedBonuses // Info for frontend
				};
			}

			user.last_activity_date = today;
		}
		else {
			// Streak broken
			user.current_streak = 1;
			user.last_activity_date = today;
		}

		await user.save();
		return { user, reward: rewardEarned };
	}
}