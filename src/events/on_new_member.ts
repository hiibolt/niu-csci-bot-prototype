import type { GuildMember } from "discord.js";
import NIUCSCIBot from '../lib/bot';
import { Ok, Result } from "../types/result";
import { get_env_var } from "../lib/env";
import { send_embed } from "../lib/discord";

export const on_new_member = async (
    bot: NIUCSCIBot,
    member: GuildMember
): Promise<Result> => {
    // Log the new member
    bot.print(`New member: ${member.user.username}`);

    // Get the welcome channel
    const WELCOME_CHANNEL_ID = get_env_var("WELCOME_CHANNEL_ID")
        .expect("Unreachable (checked by `verify_env_vars`)");

    const channel = (await bot.get_channel(WELCOME_CHANNEL_ID))
        .expect("Couldn't get the channel!");

    await send_embed(
        channel,
        "Welcome!",
        `Welcome to the NIU CSCI Discord, ${member.user.username}!\n\nPlease read the rules in the [#rules](https://discord.com/channels/1073676400990638111/1077001216833376306) channel and introduce yourself in the [#introductions](https://discord.com/channels/1073676400990638111/1077024687692972042) channel.`
    );

    return Ok();
};