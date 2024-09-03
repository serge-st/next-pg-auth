import sha256 from 'crypto-js/sha256';

export function isValidSHA256(input: string, hash: string) {
  return sha256(input).toString() === hash;
}
