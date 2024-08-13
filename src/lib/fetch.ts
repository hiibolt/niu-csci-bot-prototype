import { Err, Ok, type Result } from "../types/result";

/// Fetches JSON from a URL, returning a Result
///
/// # Arguments
/// * `url` - The URL to fetch JSON from
/// 
/// Returns error if the fetch or JSON unwrap fails, or the JSON if it succeeds.
export async function fetch_json (
    req: Request
): Promise<Result> {
    try {
        const response = await fetch(req);

        if (!response.ok) {
            let error_message = `Failed to fetch JSON from ${req.url} for reason:\n\t${response.status}: ${response.statusText}`;

            try {
                const body = await response.text();

                error_message += `\n\tRaw Body: ${body}`;
            } catch (error) {
                error_message += `\n\tAlso could not read body: ${error}`;
            }

            return Err(error_message);
        }

        const json = await response.json();

        return Ok(json);
    } catch (error) {
        return Err(`Failed to fetch JSON from ${req.url} for reason:\n\t${error}`);
    }
}

/// Deserializes JSON to a type, returning a Result
///
/// # Arguments
/// * `json` - The JSON to deserialize
///
/// # Returns
/// * Ok if the JSON deserialization is successful
/// * Err if the JSON deserialization fails
export function deserialize_json<T> (
    json: any
): Result {
    try {
        return Ok(JSON.parse(json) as T);
    } catch (error) {
        return Err(`Failed to deserialize JSON for reason:\n\t${error}`);
    }
}