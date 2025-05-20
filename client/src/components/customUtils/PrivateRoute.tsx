import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import useLocalStorage from "../../hooks/useLocalStorage";
// import { toast } from "react-toastify";

const PrivateRoute = () => {
  const navigate = useNavigate();
  const [accessToken] = useLocalStorage("accessToken", "");

  useEffect(() => {
    if (!accessToken) {
      //   toast.error("Please log in to access this page.");
      navigate("/", { replace: true });
    }
  }, [accessToken, navigate]);

  return accessToken ? <Outlet /> : null;
};

export default PrivateRoute;
