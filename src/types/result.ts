export class Result {
    private ok: boolean;
    private value: any;

    /// Constructor function.
    ///
    /// # Arguments
    /// * `ok` - A boolean indicating if the result is an error or not.
    /// * `value` - The value of the result or the error message.
    constructor(
        ok: boolean,
        value: any
    ) {
        this.ok = ok;
        this.value = value;
    }

    toString () {
        return `[ Result: ${this.ok ? "Ok" : "Err"} ](${this.value})`;
    }

    [Symbol.for('nodejs.util.inspect.custom')](_1: any, _2: any, _3: any) {
        return `[ Result: ${this.ok ? "Ok" : "Err"} ](${this.value})`;
    }


    /// Checks if the result is an ok result.
    public is_ok(): boolean {
        return this.ok;
    }

    /// Checks if the result is an error result.
    public is_err(): boolean {
        return !this.ok;
    }


    /// Unwraps the result, returning the value,
    ///  or panicking if the result is an error.
    public unwrap(): any {
        if (this.ok) {
            return this.value;
        } else {
            console.error(`Called unwrap on an error!\n\tError: ${this.value}`);
            process.exit(1);
        }
    }

    /// Unwraps the result, returning the error,
    ///  or panicking if the result is ok.
    public unwrap_err(): any {
        if (this.ok) {
            console.error(`Called unwrap_err on an ok result!\n\tValue: ${this.value}`);
            process.exit(1);
        } else {
            return this.value;
        }
    }

    /// Unwraps the result, returning the value,
    ///  or panicking with a custom message if the result
    ///  is an error.
    public expect(reason: string): any {
        if (this.ok) {
            return this.value;
        } else {
            console.error(`Called \`expect()\` on an Err!\n\t"${reason}"\n\tError: ${this.value}`);
            process.exit(1);
        }
    }


    /// Call one of two functions depending on the result.
    ///
    /// # Arguments
    /// * `ok_callback` - The function to call if the result is ok.
    /// * `errCallback` - The function to call if the result is an error.
    public match(
        ok_callback: Function,
        err_callback: Function
    ) {
        if (this.ok) {
            return ok_callback(this.value);
        } else {
            return err_callback(this.value);
        }
    }

    /// Only uses the callback if the result is ok.
    ///
    /// # Arguments
    /// * `callback` - The function to call if the result is ok.
    public and_then(callback: Function) {
        if (this.ok) {
            return callback(this.value);
        } else {
            return this;
        }
    }

    /// Only uses the callback if the result is an error.
    ///
    /// # Arguments
    /// * `callback` - The function to call if the result is an error.
    public or_else(callback: Function) {
        if (this.ok) {
            return this;
        } else {
            return callback(this.value);
        }
    }
}

/// The Result variants
export function Ok (value?: any): Result {
    return new Result(true, value || new Nothing());
}
export function Err (value?: any): Result {
    return new Result(false, value || new Nothing());
}

/// A class representing nothing, but not null.
class Nothing {
    toString () {
        return "[ Empty Value ]";
    }

    [Symbol.for('nodejs.util.inspect.custom')](_1: any, _2: any, _3: any) {
        return "[ Empty Value ]";
    }
};