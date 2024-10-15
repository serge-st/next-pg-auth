export const generatePassword = (length: number): string => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result: string = '';
  for (let i = 0; i < length; i++) {
    const charIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(charIndex);
  }

  return result;
};
