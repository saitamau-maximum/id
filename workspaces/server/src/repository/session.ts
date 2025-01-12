/**
 * Interface representing a session repository.
 */
export interface ISessionRepository {
	/**
	 * Stores a one-time token with a specified time-to-live (TTL).
	 *
	 * @param token - The one-time token to be stored.
	 * @param payload - The payload associated with the token.
	 * @param ttl - The time-to-live for the token in seconds.
	 * @returns A promise that resolves when the token is successfully stored.
	 */
	storeOneTimeToken: (
		token: string,
		payload: string,
		ttl: number,
	) => Promise<void>;

	/**
	 * Verifies a one-time token and returns the associated user ID if valid.
	 *
	 * @param token - The one-time token to be verified.
	 * @returns A promise that resolves to the user ID if the token is valid, or null if invalid.
	 */
	verifyOneTimeToken: (token: string) => Promise<string | null>;
}
