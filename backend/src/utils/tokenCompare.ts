import bcrypt from 'bcryptjs';

/**
 * Safely hashes tokens or credentials before storing in the database.
 */
export const hashToken = async (token: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

/**
 * Compares a raw token against a hashed database record in constant time.
 */
export const compareTokens = async (rawToken: string, hashedToken: string): Promise<boolean> => {
  return bcrypt.compare(rawToken, hashedToken);
};
