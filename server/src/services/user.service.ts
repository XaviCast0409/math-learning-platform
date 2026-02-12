// src/services/user.service.ts
import { User, Clan } from '../models';
import { calculateLevelFromXP, calculateXpForLevel, LEVEL_REWARDS, MAX_LEVEL } from '../config/gamification.config';
import { GAME_CONFIG } from '../config/game.config';
// 👇 Import INSTANCES
import { rewardService } from './reward.service';
import { clanService } from './clan.service';

interface XpGainResult {
	user: User;
	leveledUp: boolean;
	levelsGained: number;
	rewards: {
		gems: number;
		lives: number;
		items: string[];
		bonusesApplied?: string[];
	};
}

export class UserService {

	async addExperience(userId: number, xpAmount: number): Promise<XpGainResult> {
		const user = await User.findByPk(userId);
		if (!user) throw new Error('Usuario no encontrado');

		const previousLevel = user.level;

		// 👇 using instance method
		const { finalXp, appliedBonuses } = await rewardService.calculateBonuses(
			userId,
			xpAmount,
			0
		);

		user.xp_total += finalXp;

		if (user.clan_id) {

			clanService.addClanXp(user.clan_id, finalXp).catch(err =>
				console.error(`[UserService] Error adding Clan XP: ${err.message}`)
			);
		}

		const newLevel = calculateLevelFromXP(user.xp_total);

		const totalRewards = {
			gems: 0,
			lives: 0,
			items: [] as string[],
			bonusesApplied: appliedBonuses
		};

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

			user.gems += totalRewards.gems;

			if (totalRewards.lives > 0) {
				user.lives += totalRewards.lives;
			} else {
				user.lives = GAME_CONFIG.DEFAULTS.INITIAL_LIVES;
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

	getProgressInfo(user: User) {
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

	async updateStreak(user: User) {
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
			user.current_streak += 1;

			if (user.current_streak > user.highest_streak) {
				user.highest_streak = user.current_streak;
			}

			const milestone = GAME_CONFIG.STREAKS.MILESTONES[user.current_streak];
			if (milestone) {
				// 👇 using instance method
				const { finalXp, finalGems, appliedBonuses } = await rewardService.calculateBonuses(
					user.id,
					milestone.xp,
					milestone.gems
				);

				user.xp_total += finalXp;
				user.gems += finalGems;

				if (user.clan_id) {
					clanService.addClanXp(user.clan_id, finalXp).catch(console.error);
				}

				rewardEarned = {
					streak: user.current_streak,
					xp: finalXp,
					gems: finalGems,
					message: milestone.message,
					bonuses: appliedBonuses
				};
			}

			user.last_activity_date = today;
		}
		else {
			user.current_streak = 1;
			user.last_activity_date = today;
		}

		await user.save();
		return { user, reward: rewardEarned };
	}
}

export const userService = new UserService();
