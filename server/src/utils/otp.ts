export const DEFAULT_OTP_LENGTH = 6;
export const OTP_VALIDITY_MS = 10 * 60 * 1000; // 10 minutes

export const generateOTP = (length = DEFAULT_OTP_LENGTH): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};
