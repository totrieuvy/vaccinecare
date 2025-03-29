import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import ChatWithGemini from "./ChatWithGemini";

const MainLayout = () => {
  const { token } = useSelector((state) => state.user); // Kiểm tra trạng thái đăng nhập

  return (
    <div>
      <Outlet /> {/* Render các route con */}
      {token && <ChatWithGemini />} {/* Hiển thị chat nếu đã đăng nhập */}
    </div>
  );
};

export default MainLayout;
