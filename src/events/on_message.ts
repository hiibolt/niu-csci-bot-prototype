import type { Message } from "discord.js";
import type NIUCSCIBot from "../lib/bot";
import { Err, Ok } from "../types/result";
import type { DiscordUser } from "../types/database";

const on_message = async (bot: NIUCSCIBot, message: Message) => {
    // Ignore self
    if (message.author.bot) {
        return Ok();
    }

    // Print the message
    bot.print(`New Message:\n- Content: '${message.content}'\n- Author: ${message.author.id}\n`);

    // Update the user's XP
    bot.update_xp(message);

    return Ok();
};

export default on_message;