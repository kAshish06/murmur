import { Phone } from "lucide-react";
import { useSearchUsersQuery } from "../../Auth/query/authQuery";
import RotatingArrowLoader from "./RotatingArrowLoader";
import type { User } from "../../Auth/types";

type Props = {
  searchQuery: string;
  handleUserClick: (user: User) => void;
};

export const SearchedUserList = ({ searchQuery, handleUserClick }: Props) => {
  const {
    data: searchUsers,
    isPending: isSearchPending,
    isError: isSearchError,
  } = useSearchUsersQuery(searchQuery);

  if (!searchQuery) {
    return null;
  }
  if (isSearchPending) {
    return <RotatingArrowLoader>Searching users ...</RotatingArrowLoader>;
  }
  if (isSearchError) {
    return <div>Error loading users. Please try again later.</div>;
  }
  return (
    <>
      {searchUsers?.map((user) => (
        <div
          key={user.id}
          className="bg-gray-200 text-gray-900 px-3 py-3 rounded-lg cursor-pointer text-left transition-colors duration-200 hover:bg-gray-300"
          onClick={() => handleUserClick(user)}
        >
          <span className="font-semibold">{user.username}</span>
          {user.email && (
            <span className="text-xs">
              {" - "}
              {user.email}
            </span>
          )}
          <div className="flex items-center gap-1 px-1">
            <Phone size={16} />
            <span>{" - "}</span>
            <span className="text-xs">{user.phone}</span>
          </div>
        </div>
      ))}
    </>
  );
};
