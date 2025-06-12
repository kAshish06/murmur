import { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { Search, X } from "lucide-react";
import InputField from "../atoms/InputField";

export type SearchUserRef = {
  closeSearch: () => void;
};

const SearchUser = forwardRef<
  SearchUserRef | null,
  { onSearch: (query: string) => void }
>(({ onSearch }, ref) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchPending, setIsSearchPending] = useState(false);
  const handleSearchClose = useCallback(() => {
    if (isSearchPending) {
      setIsSearchPending(false);
      setSearchQuery("");
      onSearch("");
      return;
    }
    onSearch(searchQuery);
    setIsSearchPending(true);
  }, [isSearchPending, onSearch, searchQuery]);
  useImperativeHandle(
    ref,
    () => ({
      closeSearch: () => {
        handleSearchClose();
      },
    }),
    [handleSearchClose]
  );

  return (
    <div className="relative w-full max-w-md">
      <InputField
        id="searchUserQuery"
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        inputClassName="pr-10"
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleSearchClose();
          }
        }}
      />
      <div
        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        onClick={handleSearchClose}
        aria-label="Initiate search"
        role="button"
        tabIndex={0}
      >
        {isSearchPending ? (
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        ) : (
          <Search className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        )}
      </div>
    </div>
  );
});

export default SearchUser;
