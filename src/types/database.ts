export interface DiscordUser {
    Id: number; // Intentionally capitalized to match NocoDB's API
    discord_user_id: string;
    xp: number;
    level: DiscordUserLevel;
}
export enum DiscordUserLevel {
    New = 0,
    Regular = 1,
    Veteran = 2
}
export const LevelUpThresholds: Array<number> = [
    3, // Regular
    5  // Veteran
];