import { useState } from "react";
import { User as UserIcon, LogOut, Settings2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import Dropdown from "../atoms/Dropdown";
import { useLogoutMutation } from "../../Auth/query/authQuery";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useNavigate } from "react-router";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../constants";

const User = () => {
  const navigate = useNavigate();
  const [refreshToken, setRefreshToken] = useLocalStorage(
    REFRESH_TOKEN_KEY,
    ""
  );
  const [, setAccessToken] = useLocalStorage(ACCESS_TOKEN_KEY, "");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { user, setUser } = useAuthStore();
  const onSuccess = () => {
    setUser(null);
    setAccessToken("");
    setRefreshToken("");
    navigate("/");
  };
  const onError = () => {
    // notify user about logout failure.
  };
  const logoutMutation = useLogoutMutation(onSuccess, onError);
  const options = [
    {
      label: "Settings",
      icon: <Settings2 />,
      onClick: () => {},
    },
    {
      label: "Logout",
      icon: <LogOut />,
      onClick: async () => {
        await logoutMutation.mutateAsync(refreshToken);
      },
    },
  ];
  return (
    <div>
      <UserIcon
        onClick={() => setIsOptionsOpen(true)}
        className="cursor-pointer"
      />
      <Dropdown isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)}>
        <div className="text-gray-600 border-b p-2 text-left text-lg font-semibold">
          {user?.username}
        </div>
        <div className="text-left py-1">
          {options.map((option) => (
            <div
              key={option.label}
              onClick={option.onClick}
              className="px-3 py-2 mt-1 cursor-pointer transition-colors duration-200 hover:bg-gray-200 flex items-center gap-2"
            >
              {option.icon}
              {option.label}
            </div>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};

export default User;
