export const getUtcUnixTimeStampInMilliseconds = () => {
  return Math.floor(new Date().getTime());
};

export const getUtcUnixTimeStampInSeconds = () => {
  return Math.floor(new Date().getTime() / 1000);
};
