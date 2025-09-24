import crypto from "crypto";

const CHARACTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateShortCode = (length: number = 8): string => {
  let result = "";
  const charactersLength = CHARACTERS.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += CHARACTERS.charAt(randomIndex);
  }

  return result;
};

export const generateUniqueShortCode = async (
  checkFunction: (code: string) => Promise<boolean>,
  length: number = 8,
  maxAttempts: number = 10
): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateShortCode(length);
    const isUnique = await checkFunction(code);

    if (isUnique) {
      return code;
    }
  }

  throw new Error("Unable to generate unique short code");
};

export const isValidShortCode = (code: string): boolean => {
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(code) && code.length >= 4 && code.length <= 50;
};
