import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import PrivateRoute from "./components/customUtils/PrivateRoute";
import { appRoutes } from "./routes/appRoutes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading ...</div>}>
        <Routes>
          {appRoutes.map(
            ({ name, path, component: Component, isProtected }) => {
              return isProtected ? (
                <Route key={name} element={<PrivateRoute />}>
                  <Route path={path} element={<Component />} />
                </Route>
              ) : (
                <Route key={name} path={path} element={<Component />} />
              );
            }
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
