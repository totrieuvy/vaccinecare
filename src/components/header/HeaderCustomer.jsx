import { useState, useEffect } from "react";
import { ConfigProvider, Button, Menu, Drawer, Dropdown } from "antd";
import {
  CalendarOutlined,
  MenuOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  SolutionOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./Header.css";
import { logout } from "../../redux/features/userSlice";
import { persistor } from "../../redux/store";

const Header = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hàm xử lý logout
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    // Force purge the persisted state
    persistor.purge();
    navigate("/");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/children-profile">Hồ sơ trẻ em</Link>
      </Menu.Item>
      <Menu.Item key="records" icon={<UserOutlined />}>
        <Link to="/medical-records">Lịch đăng kí tiêm</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "about",
      icon: <InfoCircleOutlined />,
      label: <Link to="/about-us">Về chúng tôi</Link>,
    },
    {
      key: "vaccination",
      icon: <MedicineBoxOutlined />,
      label: <Link to="/vaccination">Vaccine</Link>,
    },
    {
      key: "register",
      icon: <CalendarOutlined />,
      label: <Link to="/register-schedule">Đăng kí tiêm</Link>,
    },
    {
      key: "children",
      icon: <SolutionOutlined />,
      label: <Link to="/register-children">Đăng kí hồ sơ trẻ</Link>,
    },
  ];

  return (
    <div className="HomePage-Header-wrapper">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#9989C5",
          },
          components: {
            Menu: {
              horizontalItemBorderWidth: 0,
            },
          },
        }}
      >
        <header className="HomePage-Header">
          <div className="HomePage-Header-container">
            {isMobile && (
              <Button
                icon={<MenuOutlined />}
                onClick={() => setShowDrawer(true)}
                className="HomePage-Header-menu-button"
              />
            )}

            <Link to="/" className="HomePage-Header-logo-link">
              <div className="HomePage-Header-logo-container">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/005/364/630/non_2x/immune-vaccine-inspiration-illustration-logo-vector.jpg"
                  alt="Logo"
                  className="HomePage-Header-logo-image"
                />
              </div>
              <h1 className="HomePage-Header-title">Vaccine Care</h1>
            </Link>

            {isMobile &&
              (user.userName ? (
                <Dropdown overlay={userMenu} trigger={["click"]}>
                  <Button type="text" className="HomePage-Header-welcome">
                    Welcome, {user.userName}
                  </Button>
                </Dropdown>
              ) : (
                <Link to="/login">
                  <Button type="primary">Đăng nhập</Button>
                </Link>
              ))}
          </div>
        </header>

        {!isMobile && (
          <div className="HomePage-Header-submenu-container">
            <div className="HomePage-Header-submenu-wrapper">
              <Menu mode="horizontal" className="HomePage-Header-desktop-menu" items={menuItems} />
              {user.userName ? (
                <Dropdown overlay={userMenu} trigger={["click"]}>
                  <Button type="text" className="HomePage-Header-welcome">
                    Welcome, {user.userName}
                  </Button>
                </Dropdown>
              ) : (
                <Link to="/login">
                  <Button type="primary" className="HomePage-Header-signin-button">
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        <Drawer title="Menu" placement="left" onClose={() => setShowDrawer(false)} open={showDrawer} width={280}>
          <Menu
            mode="vertical"
            className="HomePage-Header-menu HomePage-Header-mobile-menu"
            items={menuItems}
            onClick={() => setShowDrawer(false)}
          />
        </Drawer>
      </ConfigProvider>
    </div>
  );
};

export default Header;
