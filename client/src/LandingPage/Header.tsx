import Button from "../components/atoms/Button";

type props = {
  onLoginClick: (modal: "login" | "register") => void;
};
export default function Header({ onLoginClick }: props) {
  return (
    <header className="flex justify-between items-center px-8">
      <h1 className="text-2xl font-bold">Murmur</h1>
      <Button btnType="link" onClick={() => onLoginClick("login")}>
        Login
      </Button>
    </header>
  );
}
