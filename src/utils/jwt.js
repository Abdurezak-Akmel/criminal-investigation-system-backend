import 'dotenv/config';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_to_a_secure_value";

/**
 * Generate a signed JWT for the given payload.
 * @param {Object} payload - The payload to embed in the token (e.g., { id, role }).
 * @param {string|number} [expiresIn='1h'] - Expiration for the token (e.g., '1h', '7d', 3600).
 * @returns {string} Signed JWT string.
 */
export function generateToken(payload, expiresIn = "1h") {
	return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT and return the decoded payload. Throws on invalid/expired tokens.
 * @param {string} token - JWT string to verify.
 * @returns {Object} Decoded token payload.
 */
export function verifyToken(token) {
	return jwt.verify(token, JWT_SECRET);
}

export default { generateToken, verifyToken };

