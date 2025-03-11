import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChatPage } from "../pages/ChatPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { useEffect, useState } from "react";
import { onAuthStateChanged, auth, getDoc, db, doc } from "./firebase";
import { Spin } from "antd";
import ProfilePage from "../pages/ProfilePage";

export const AppRouter = () => {
  const [User, setUser] = useState(false);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(true);
        }
      } else {
        setUser(false);
      }
      setLoader(false);
    });
  }, []);

  return (
    <>
      {loader ? (
        <Spin
          style={{
            display: "flex",
            height: "100vh",
            justifyContent: "center",
            alignItems: "center",
          }}
          size="large"
        />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={User ? <Navigate to={"/chatapp"} /> : <LoginPage />}
            />
            <Route
              path="/register"
              element={User ? <Navigate to={"/chatapp"} /> : <RegisterPage />}
            />
            <Route
              path="/chatapp"
              element={User ? <ChatPage /> : <Navigate to={"/"} />}
            />
            <Route
              path="/profile"
              element={User ? <ProfilePage /> : <Navigate to={"/"} />}
            />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};
