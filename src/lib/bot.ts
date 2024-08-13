import { GatewayIntentBits, Client, Events, Message, GuildMember, type TextBasedChannel, type Channel } from "discord.js";
import on_message from "../events/on_message.ts";
import on_ready from "../events/on_ready.ts";
import on_new_member from "../events/on_new_member.ts";
import Database from "./database.ts";
import { get_env_var } from "./env.ts";
import { send_embed, send_error_embed } from "./discord.ts";
import type { DiscordUser } from "../types/database.ts";
import { Err, Ok, Result } from "../types/result.ts";
import { LevelUpThresholds } from "../types/database.ts";

export default class NIUCSCIBot {
    private client:   Client;
    private database: Database;

    constructor() {
        // Build our client with the necessary intents,
        //  plus automatic sharding
        this.client = new Client({ 
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.MessageContent,
            ],
            shards: "auto"
        });

        // Create a new database instance
        this.database = new Database();
    }

    public print(message: string) {
        console.log("\x1b[34m%s\x1b[0m", `[DISCORD] ${message}`);
    }
    public error(message: string) {
        console.error(`[DISCORD] ${message}`);
    }

    /* 
        * Discord functions
        */
    /// Gets a channel by ID
    ///
    /// # Arguments
    /// * `channel_id` - The ID of the channel to get
    public async get_channel(
        channel_id: string
    ): Promise<Result> {
        const channel: Channel | undefined = this.client.channels.cache.get(channel_id);

        if (channel === undefined) {
            return Err(`Failed to get channel with ID ${channel_id}! Does it exist?`);
        }

        return Ok(channel);
    }

    /// Update the XP of a user
    ///
    /// # Arguments
    /// * `user_id` - The ID of the user to update
    ///
    /// # Notes
    /// * While this function does not return a Result, it will log any errors
    public async update_xp(
        message: Message
    ): Promise<void> {
        // Get the user and add 1 XP
        const member = (await this.database.get_member(message.author.id))
            .and_then((user: DiscordUser) => {
                user.xp += 1;

                if ( user.level < LevelUpThresholds.length ) {
                    if ( user.xp >= LevelUpThresholds[user.level] ) {
                        user.level += 1;
                        user.xp = 0;

                        // Send a message to the channel congratulating the user
                        send_embed(
                            message.channel,
                            "Level Up!",
                            `Congratulations, <@${message.author.id}>! You've leveled up to level ${user.level}!`
                        );
                    }
                }
                
                return Ok(user);
            });
    
        // Update the user with the new XP
        if (member.is_ok()) {
            if ( (await this.database.update_member(member.unwrap())).is_err() ) {
                this.error("Failed to update user!");
            }
        } else {
            this.error(`Failed to get user! Error: ${member.unwrap_err()}`);
        }
    }

    public async start() {
        // Authenticate the bot
        this.print('Authenticating bot...');
        await this.client.login(get_env_var("DISCORD_ACCESS_TOKEN")
            .expect("Unreachable (checked by `verify_env_vars`)"));

        // Verify the database connection
        (await this.database.verify())
            .match(
                (_: any) => this.database.print("Database connection successful!"),
                (error: any) => {
                    this.database.error(error);
                    process.exit(1);
                }
            );

        // Set up event listeners
        this.print('Setting up event listeners...');
        this.client.on(Events.ClientReady, (client: Client) => { 
            on_ready(this, client).then((result) => result.match(
                (_: any) => this.print("Discord Bot is ready!"),
                (error: any) => {
                    this.error(error);
                    process.exit(1);
                }
            ));
        });
        this.client.on(Events.MessageCreate, (message: Message) => { 
            on_message(this, message).then((result) => result.match(
                (res: any) => { },
                (error: any) => {
                    // Forward the error message to the channel
                    send_error_embed(
                        message.channel,
                        "An error occurred!",
                        error
                    );
                }
            ));
        });
        this.client.on(Events.GuildMemberAdd, (member: GuildMember) => { 
            on_new_member(this, member).then((result: any) => result.match(
                (_: any) => this.print("Discord Bot is ready!"),
                (error: any) => {
                    this.error(error);
                    process.exit(1);
                }
            ));
        });
    }
}