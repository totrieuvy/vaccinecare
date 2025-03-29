import { Button, Result } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { HomeOutlined, CheckOutlined } from "@ant-design/icons";
import "./RegisterChildrenSuccess.scss";

const RegisterChildrenSuccess = () => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate("/children-list");
  };

  const handleRegisterAnother = () => {
    navigate("/register-children");
  };

  return (
    <div className="RegisterChildrenSuccess">
      <div className="success-card">
        <div className="checkmark-circle">
          <CheckOutlined className="checkmark" />
        </div>

        <Result
          status="success"
          title="Đăng ký hồ sơ trẻ thành công!"
          subTitle="Thông tin của trẻ đã được lưu trữ trong hệ thống"
          extra={[
            <Button type="primary" key="profile" onClick={handleViewProfile}>
              Xem danh sách trẻ
            </Button>,
            <Button key="register" onClick={handleRegisterAnother}>
              Đăng ký thêm trẻ
            </Button>,
          ]}
        />

        <Link to="/" className="home-link">
          <HomeOutlined /> Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default RegisterChildrenSuccess;
