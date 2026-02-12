
export interface ServerToClientEvents {
    // General
    err: (data: { message: string; code?: string }) => void;

    // Connection / Status
    online_users_update: (users: OnlineUser[]) => void;

    // Matchmaking
    queue_status: (data: { status: 'waiting' | 'idle' }) => void;
    incoming_challenge: (data: { challengerId: number; challengerName: string }) => void;
    challenge_declined: (data: { message: string }) => void;
    match_start: (data: MatchStartData) => void;

    // Match Gameplay
    opponent_action: (data: OpponentAction) => void;
    answer_result: (data: { correct: boolean; points?: number }) => void;
    opponent_emote: (data: { emoji: string }) => void;
    match_finished: (data: MatchResult) => void;

    // Raid
    raid_error: (data: { message: string }) => void;
    raid_timeout: (data: { message: string }) => void;
    raid_boss_skill: (data: { skill: string; duration: number }) => void;
    raid_init: (data: RaidInitData) => void;
    raid_hp_update: (data: RaidHpUpdateData) => void;
    raid_more_questions: (data: { questions: any[] }) => void;
    raid_victory: (data: RaidVictoryData) => void;
}

export interface ClientToServerEvents {
    // Connection
    join_queue: () => void;
    leave_queue: () => void;

    // Challenge
    challenge_player: (data: { targetUserId: number }) => void;
    challenge_response: (data: { targetUserId: number; accept: boolean }) => void;

    // Match Gameplay
    submit_answer: (data: { questionId: number; answer: string; timeTaken: number }) => void;
    send_emote: (data: { matchId: number; emoji: string }) => void;

    // Raid
    raid_join: (data: { raidId: number; userId: number }) => void;
    raid_submit_damage: (data: { raidId: number; userId: number; damage: number }) => void;
    raid_fetch_more_questions: (data: { userId: number; existingQuestionIds: number[] }) => void;
    raid_leave: (data: { raidId: number }) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    userId: number;
    username: string;
    elo: number;
}

// Shared Interfaces
export interface OnlineUser {
    userId: number;
    socketId: string;
    username: string;
    elo: number;
    status: 'IDLE' | 'SEARCHING' | 'PLAYING';
}

export interface MatchStartData {
    matchId: number;
    questions: any[];
    opponent: { id: number; username: string };
    startTime: number;
}

export interface OpponentAction {
    type: 'answer_correct' | 'answer_wrong';
    questionId?: number;
    newScore?: number;
}

export interface MatchResult {
    winnerId: number | null;
    eloChange: number;
    p1Score: number;
    p2Score: number;
    newEloP1: number;
    newEloP2: number;
    rewardsDetail: {
        winner: MatchRewardDetail;
        loser: MatchRewardDetail;
    };
}

export interface MatchRewardDetail {
    xp: number;
    gems: number;
    bonuses: string[];
}

export interface RaidInitData {
    bossName: string;
    totalHp: number;
    currentHp: number;
    image: string;
    endTime: number;
    questions: any[];
}

export interface RaidHpUpdateData {
    newHp: number;
    damageDealt: number;
    attackerId: number;
    leaderboard: { username: string; totalDamage: number; avatar?: string }[];
}

export interface RaidVictoryData {
    message: string;
    mvp: { username: string; totalDamage: number };
    rewards: { xp: number; gems: number };
}
