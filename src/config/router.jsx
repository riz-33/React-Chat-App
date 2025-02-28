import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChatPage } from "../pages/ChatPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NewRegisterPage } from "../pages/NewPage.jsx";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element=<LoginPage /> />
        <Route path="/register" element=<RegisterPage /> />
        <Route path="/newregister" element=<NewRegisterPage/>/>
        <Route path="/chatapp" element=<ChatPage /> />

      </Routes>
    </BrowserRouter>
  );
};
