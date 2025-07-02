import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import HeroSection from "./HeroSection";
import FeatureSection from "./FeaturesSection";
import Footer from "./Footer";
import Modal from "../components/atoms/Modal";
import Register from "../Auth/Register";
import useLocalStorage from "../hooks/useLocalStorage";
import { ACCESS_TOKEN_KEY } from "../constants";

export default function LandingPage() {
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const accessToken = useLocalStorage(ACCESS_TOKEN_KEY, "");
  const navigate = useNavigate();
  useEffect(() => {
    if (accessToken[0]) {
      navigate("/conversations");
    }
  }, []);
  const closeModal = () => setShowRegisterModal(false);

  return (
    <div className="pl-8 pr-8">
      <HeroSection onRegisterClick={() => setShowRegisterModal(true)} />
      <FeatureSection />
      <Footer />
      {showRegisterModal && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          body={<Register closeModal={closeModal} />}
        />
      )}
    </div>
  );
}
