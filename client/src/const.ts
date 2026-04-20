export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local auth - redirect to /login page (independent from Manus OAuth)
export const getLoginUrl = (_returnPath?: string) => {
  return "/login";
};
