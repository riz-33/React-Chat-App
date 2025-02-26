import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChatPage } from "../pages/ChatPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element=<LoginPage /> />
        <Route path="/register" element=<RegisterPage /> />
        <Route path="/chatapp" element=<ChatPage /> />

      </Routes>
    </BrowserRouter>
  );
};
