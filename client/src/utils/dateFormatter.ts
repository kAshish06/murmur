import { DAY } from "../constants";

/** Returns Today, Yesterday or date in dd/mm/yyyy format */
export const getDateString = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  if (date.getDate() - today.getDate() === 0) {
    return DAY.TODAY;
  } else if (date.getDate() - today.getDate() === 1) {
    return DAY.YESTERDAY;
  }
  return date.toLocaleDateString();
};
