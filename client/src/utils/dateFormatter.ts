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
    return `${formatDatePart(date.getHours())}:${formatDatePart(
      date.getMinutes()
    )}`;
  } else if (diffInDays == 1) {
    return DAY.YESTERDAY;
  }
  return date.toLocaleDateString();
};

export const formatDatePart = (datePart: number): string => {
  if (!datePart) return ``;
  if (datePart < 10) {
    return `0${datePart}`;
  }
  return `${datePart}`;
};
