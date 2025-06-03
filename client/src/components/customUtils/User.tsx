import { useState } from "react";
import { User as UserIcon, LogOut, Settings2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import Dropdown from "../atoms/Dropdown";

const User = () => {
  const options = [
    {
      label: "Settings",
      icon: <Settings2 />,
      onClick: () => {},
    },
    {
      label: "Logout",
      icon: <LogOut />,
      onClick: () => {},
    },
  ];
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { user } = useAuthStore();
  return (
    <div>
      <UserIcon
        onClick={() => setIsOptionsOpen(true)}
        className="cursor-pointer"
      />
      <Dropdown isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)}>
        <div className="text-gray-600">{user?.username}</div>
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
