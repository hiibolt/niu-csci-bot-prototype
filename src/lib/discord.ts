import { EmbedBuilder, type GuildTextBasedChannel, type If, type TextBasedChannel, type TextChannel } from "discord.js";

/// Send an error embed to a channel
///
/// # Arguments
/// * `channel` - The channel to send the embed to
/// * `title` - The title of the embed
/// * `body` - The body of the embed
/// * (optional) `thumbnail_url` - The URL of the thumbnail to use
export async function send_error_embed(
    channel: TextBasedChannel,
    title: string,
    body: string,
    thumbnail_url?: string
) {
    // Create a new error embed
    const error_embed = new EmbedBuilder()
        .setColor(0xf08080)
        .setTitle(title)
        .setDescription(body)
        .setTimestamp()
        .setThumbnail(thumbnail_url || get_random_anime_girl());

    // Send the embed
    await channel.send({ embeds: [ error_embed ] });
}

/// Send a normal embed to a channel
///
/// # Arguments
/// * `channel` - The channel to send the embed to
/// * `title` - The title of the embed
/// * `body` - The body of the embed
/// * (optional) `thumbnail_url` - The URL of the thumbnail to use
export async function send_embed(
    channel: TextBasedChannel,
    title: string,
    body: string,
    thumbnail_url?: string
) {
    // Create a new error embed
    const error_embed = new EmbedBuilder()
        .setColor(0xFA11F2)
        .setTitle(title)
        .setDescription(body)
        .setTimestamp()
        .setThumbnail(thumbnail_url || get_random_anime_girl());

    // Send the embed
    await channel.send({ embeds: [ error_embed ] });
}

/// Does what it says on the tin
///
/// # Returns
/// * A random anime girl. Technology has come so far.
function get_random_anime_girl(): string {
    const urls = [
        "https://github.com/hiibolt/hiibolt/assets/91273156/4a7c1e36-bf24-4f5a-a501-4dc9c92514c4",
        "https://github.com/hiibolt/hiibolt/assets/91273156/831e2922-cdcb-409d-a919-1a72fbe56ff4",
        "https://github.com/hiibolt/hiibolt/assets/91273156/9098eb3f-d883-4a8b-8c6b-525869eac2a2",
        "https://github.com/hiibolt/hiibolt/assets/91273156/d8891401-df14-435b-89a5-c23da4c38354",
        "https://github.com/hiibolt/hiibolt/assets/91273156/353dea2e-f436-4289-9a10-37f9a23e3ee6",
        "https://github.com/hiibolt/hiibolt/assets/91273156/b3cf1ffd-874b-403c-9716-dce4d4f03ae0"
    ];

    return urls[Math.floor(Math.random() * urls.length)];
}