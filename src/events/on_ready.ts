import type { Client } from "discord.js";
import NIUCSCIBot from '../lib/bot';
import { Err, Ok } from "../types/result";

const on_ready = async (bot: NIUCSCIBot, readyClient: Client ) => {
	if ( readyClient.user == null ) {
        return Err("Client user is null, is the bot properly configured?");
    }

    return Ok();
};

export default on_ready;