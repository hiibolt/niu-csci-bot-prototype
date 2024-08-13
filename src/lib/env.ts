import { Err, Ok, type Result } from "../types/result";

/// Fetches an environment variable, returning a Result
///
/// # Arguments
/// * `variable_name` - The name of the environment variable to fetch
///
/// # Returns
/// * Ok if the variable is found
/// * Err if the variable is not found
export function get_env_var (
    variable_name: string
): Result {
    if (!process.env[variable_name]) {
        return Err("No DISCORD_ACCESS_TOKEN found in environment variables.");
    }
    
    return Ok(process.env[variable_name]);
}

/// Verifies that all environment variables are set
///
/// # Arguments
/// * `variables` - An array of environment variables to check
///
/// # Panics
/// If any of the environment variables are not set.
export function verify_env_vars (
    variables: Array<string>
) {
    variables.forEach((variable) => {
        if (!process.env[variable]) {
            console.error(`No ${variable} found in environment variables! Please set it.`);
            process.exit(1);
        }
    });
}