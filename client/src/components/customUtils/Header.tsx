import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import Button from "../atoms/Button";
import Modal from "../atoms/Modal";
import Login from "../../Auth/Login";
import User from "./User";

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const { user } = useAuthStore();

  const closeModal = () => setShowLoginModal(false);
  return (
    <>
      <header className="flex justify-between items-center py-4 px-4">
        <h1 className="text-2xl font-bold">Murmur</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <User />
          </div>
        ) : (
          <Button btnType="link" onClick={() => setShowLoginModal(true)}>
            Login
          </Button>
        )}
      </header>
      {showLoginModal && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          body={<Login closeModal={closeModal} />}
        />
      )}
    </>
  );
}
