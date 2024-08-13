// Load any environment variables from .env files
import dotenv from "dotenv";
dotenv.config();

// Verify all necessary environment variables are set
import { verify_env_vars } from './lib/env';
verify_env_vars([
    "DISCORD_ACCESS_TOKEN",
    "DB_API_KEY",
    "DB_BASE_URL",
    "DB_MEMBERS_TABLE_ID",
    "WELCOME_CHANNEL_ID"
]);

// Create a new bot instance, and start it
import NIUCSCIBot from './lib/bot';
new NIUCSCIBot().start();