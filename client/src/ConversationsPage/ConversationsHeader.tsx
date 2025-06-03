import { useAuthStore } from "../store/useAuthStore";
import Button from "../components/atoms/Button";

export default function ConversationsHeader() {
  const { user } = useAuthStore();

  const onLogout = () => {};

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <h1 className="text-2xl font-extrabold text-gray-900">Murmur</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">{user?.username}</span>
        <Button onClick={onLogout} btnType="primary">
          Logout
        </Button>
      </div>
    </header>
  );
}
