import { useState } from "react";
import { useNavigate } from "react-router";
import Header from "./Header";
import HeroSection from "./HeroSection";
import FeatureSection from "./FeaturesSection";
import Footer from "./Footer";
import Modal from "../components/atoms/Modal";
import Login from "../Auth/Login";
import Register from "../Auth/Register";
import type { RegisterAndLoginResponse } from "../Auth/types";
import useLocalStorage from "../hooks/useLocalStorage";
import { useAuthStore } from "../store/useAuthStore";

export default function LandingPage() {
  const [modalContent, setModalContent] = useState<
    "login" | "register" | undefined
  >();
  const { setUser } = useAuthStore();
  const accessToken = useLocalStorage("accessToken", "");
  const refreshToken = useLocalStorage("refreshToken", "");
  const navigate = useNavigate();

  const closeModal = () => setModalContent(undefined);
  const onSuccess = (data: RegisterAndLoginResponse) => {
    closeModal();
    accessToken[1](data.token);
    refreshToken[1](data.refreshToken);
    setUser(data.user);
    navigate("/chat");
  };
  const onError = () => {
    // Notify user about failure via toast
  };
  return (
    <div className="pl-8 pr-8">
      <Header onLoginClick={setModalContent} />
      <HeroSection onRegisterClick={setModalContent} />
      <FeatureSection />
      <Footer />
      {modalContent && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          body={
            modalContent === "login" ? (
              <Login
                onSuccess={onSuccess}
                onError={onError}
                onRegisterClick={setModalContent}
              />
            ) : (
              <Register
                onLoginClick={setModalContent}
                onSuccess={onSuccess}
                onError={onError}
              />
            )
          }
        />
      )}
    </div>
  );
}
