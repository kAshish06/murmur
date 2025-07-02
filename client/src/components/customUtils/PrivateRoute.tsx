import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import useLocalStorage from "../../hooks/useLocalStorage";
// import { toast } from "react-toastify";
import { ACCESS_TOKEN_KEY } from "../../constants";

const PrivateRoute = () => {
  const navigate = useNavigate();
  const [accessToken] = useLocalStorage(ACCESS_TOKEN_KEY, "");

  useEffect(() => {
    if (!accessToken) {
      //   toast.error("Please log in to access this page.");
      navigate("/", { replace: true });
    }
  }, [accessToken, navigate]);

  return accessToken ? <Outlet /> : null;
};

export default PrivateRoute;
