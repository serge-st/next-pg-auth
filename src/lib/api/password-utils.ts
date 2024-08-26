import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 8;

export async function hashPassword(data: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(data, salt);
}

export async function comparePassword(inputString: string, hashedString: string): Promise<boolean> {
  return await bcrypt.compare(inputString, hashedString);
}
