import { DAY } from "../constants";

/** Returns Today, Yesterday or date in dd/mm/yyyy format */
export const getDateString = (dateString: string) => {
  const date = new Date(dateString);
  const rawDateTime = date.getTime();
  const nowDateTime = new Date().getTime();
  const diffInDays = Math.floor(
    (nowDateTime - rawDateTime) / (1000 * 60 * 60 * 24)
  );
  if (diffInDays < 1) {
    return `${date.getHours()}:${date.getMinutes()}`;
  } else if (diffInDays > 1 && diffInDays < 2) {
    return DAY.YESTERDAY;
  }
  return date.toLocaleDateString();
};
