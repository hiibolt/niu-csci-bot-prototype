import { Err, Ok, type Result } from "../types/result";
import { get_env_var } from "./env";
import { fetch_json } from "./fetch";
import { type DiscordUser } from "../types/database";

export default class Database {
    private api_key:           string;
    private base_url: string;
    private member_table_id:   string;

    /// Create a new Database instance
    /// 
    /// # Panics
    /// * If any of the required environment variables are not set.
    constructor() {
        this.print('Database constructor');

        this.api_key = get_env_var("DB_API_KEY")
            .expect("Unreachable (checked by `verify_env_vars`)");
        this.base_url = get_env_var("DB_BASE_URL")
            .expect("Unreachable (checked by `verify_env_vars`)");
        this.member_table_id = get_env_var("DB_MEMBERS_TABLE_ID")
            .expect("Unreachable (checked by `verify_env_vars`)");
    }
    
    public print(message: string) {
        console.log("\x1b[32m%s\x1b[0m", `[DB] ${message}`);
    }
    public error(message: string) {
        console.error(`[DB] ${message}`);
    }

    /// Connect to the database, verifying that the connection is successful
    ///
    /// # Panics
    /// * If the connection fails
    public async verify(): Promise<Result> {
        const url = `${this.base_url}/api/v2/tables/${this.member_table_id}/records`;

        const req = new Request(url, {
            method: "GET",
            headers: new Headers([ 
                ["xc-token", this.api_key],
                ["Content-Type", "application/json"]
            ]),
        });

        const res = await fetch_json(req);

        return res;
    }

    /// Gets all members from the database
    ///
    /// # Returns
    /// * Ok with the array of members if the fetch is successful
    /// * Err if the fetch fails
    public async get_members(): Promise<Result> {
        const url = `${this.base_url}/api/v2/tables/${this.member_table_id}/records`;

        const req: Request = new Request(url, {
            method: "GET",
            headers: new Headers([ 
                ["xc-token", this.api_key],
                ["Content-Type", "application/json"]
            ]),
        });

        // Get the JSON response
        const res: Result = await fetch_json(req);

        // Get the list of members from the JSON response
        const list: Result = res.and_then((json: { [key: string]: string} ): Result => {
            if (json.list) {
                return Ok(json.list);
            } else {
                return Err("No records found in JSON response.\n\tResponse: " + JSON.stringify(json));
            }
        });

        // Map the list to an array of `DiscordUser`s,
        //  accomplished with `Convert.toUser(...)`
        const members: Result = list
            .and_then((list: Array<{ [key: string]: any | undefined }>): Result => {
                const users: Array<DiscordUser> = [];

                for ( const record of list ) {
                    try {
                        const fields: Array<string> = ["Id", "discord_user_id", "xp", "level"];

                        for (const field of fields) {
                            if (record[field] === undefined) {
                                return Err(`Record is missing field '${field}'!\n\tRecord: ${JSON.stringify(record, null, 2)}`);
                            }
                        }

                        users.push({
                            Id: record.Id,
                            discord_user_id: record.discord_user_id,
                            xp: record.xp,
                            level: record.level
                        });
                    } catch (error) {
                        return Err(`Failed to convert record to DiscordUser for reason:\n\t${error}`);
                    }
                }

                return Ok(users);
            });

        return members;
    }

    /// Gets a member by their Discord ID,
    ///  and creates a new record if they do not exist
    ///
    /// # Arguments
    /// * `discord_id` - The Discord ID of the member
    ///
    /// # Returns
    /// * The member record
    public async get_member(
        discord_id: string
    ): Promise<Result> {
        const members_result = await this.get_members();
        if (members_result.is_err()) {
            return Err("Failed to get members.");
        }
        const members = members_result.unwrap();

        // Try to find the member by their Discord ID
        for (const user of members) {
            if (user.discord_user_id === discord_id) {
                return Ok(user);
            }
        }

        // If the member does not exist, create a new record
        this.print("Creating new member record...");

        // Build the URL
        const url = `${this.base_url}/api/v2/tables/${this.member_table_id}/records`;

        // Build the request
        const req = new Request(url, {
            method: "POST",
            headers: new Headers([ 
                ["xc-token", this.api_key],
                ["Content-Type", "application/json"]
            ]),
            body: JSON.stringify([ {
                discord_user_id: discord_id,
                xp: 0,
                level: 0
            } ]),
        });

        // Create the new member record
        return (await fetch_json(req))
            .and_then((json: { [key: string]: any }): Result => {
                if (json[0] !== undefined && json[0].Id !== undefined) {
                    return Ok({
                        Id: json[0].Id,
                        discord_user_id: discord_id,
                        xp: 0,
                        level: 0
                    });
                } else {
                    return Err("No ID found in JSON response.\n\tResponse: " + JSON.stringify(json));
                }
            });
    }

    /// Updates a member record by their Discord ID
    ///
    /// # Arguments
    /// * `discord_id` - The Discord ID of the member
    /// * `new_record` - The new record to update the member with
    ///
    /// # Returns
    /// * Ok if the update is successful
    /// * Err if the update fails
    public async update_member(
        new_record: DiscordUser
    ): Promise<Result> {
        // Build the URL
        const url = `${this.base_url}/api/v2/tables/${this.member_table_id}/records`;

        // Build the request
        const req = new Request(url, {
            method: "PATCH",
            headers: new Headers([ 
                ["xc-token", this.api_key],
                ["Content-Type", "application/json"]
            ]),
            body: JSON.stringify([ new_record ]),
        });

        // Update the member record
        if ((await fetch_json(req)).is_err()) {
            return Err("Failed to update member record.");
        };

        return Ok();
    }
}