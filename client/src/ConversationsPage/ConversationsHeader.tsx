import { useAuthStore } from "../store/useAuthStore";
import Button from "../components/atoms/Button";
export default function ConversationsHeader() {
  const { user } = useAuthStore();

  const onLogout = () => {};

  return (
    <header className="flex items-center justify-between ">
      <h1 className="text-xl font-semibold text-gray-800">
        Murmur | {user?.username}
      </h1>
      <div>
        <Button btnType="link" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
