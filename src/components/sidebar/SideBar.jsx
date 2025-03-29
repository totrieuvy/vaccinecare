import { useState, useEffect } from "react";
import {
  TeamOutlined,
  UserOutlined,
  PoweroffOutlined,
  AreaChartOutlined,
  MedicineBoxOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Sidebar.scss";
import { logout } from "../../redux/features/userSlice";

const { Content, Footer, Sider } = Layout;

const siderStyle = {
  height: "100vh",
  position: "sticky",
  top: 0,
  bottom: 0,
  overflow: "auto",
};

const getItem = (label, key, icon, children) => {
  if (children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }
  return {
    key,
    icon,
    label: <Link to={key}>{label}</Link>,
  };
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const user = useSelector((state) => state?.user);
  const [menuItems, setMenuItems] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Đăng xuất người dùng
    localStorage.removeItem("token"); // Xóa token

    // Điều hướng đến trang login sử dụng đường dẫn tuyệt đối
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    let items = [];

    if (user?.roleName === "admin") {
      items = [
        getItem("Dashboard", "dashboard", <AreaChartOutlined />, [
          getItem("Total account", "dashboard/total-account"),
          getItem("Total revenue", "dashboard/total-revenue"),
          getItem("Total vaccine", "dashboard/total-vaccine"),
        ]),
        getItem("Chat", "chat", <MedicineBoxOutlined />),
      ];
    } else if (user?.roleName === "manager") {
      items = [
        getItem("Vaccine", "vaccine", <MedicineBoxOutlined />),
        getItem("Chat", "chat", <MedicineBoxOutlined />),
        getItem("Package Vaccine", "package-vaccine", <MedicineBoxOutlined />),
        getItem("Manufacture", "manufacture", <ToolOutlined />),
        getItem("Batch", "batch", <ToolOutlined />),
        getItem("Human resources", "personnel", <TeamOutlined />, [getItem("Staff", "staff")]),
      ];
    }

    setMenuItems(items);
  }, [user?.roleName, user?.id]);

  return (
    <Layout>
      <Sider
        className="sidebar-menu"
        style={siderStyle}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="md"
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          items={menuItems.map((item) => (collapsed ? { ...item, label: "" } : item))}
        />

        {/* Nút Đăng xuất nằm dưới cùng */}
        <div className="logout-container">
          <Button type="primary" danger icon={<PoweroffOutlined />} onClick={handleLogout} block>
            Đăng xuất
          </Button>
        </div>
      </Sider>
      <Layout>
        {/* <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        /> */}
        <Content
          style={{
            margin: "24px 16px 0",
            overflow: "initial",
          }}
        >
          <div
            style={{
              padding: 24,
              textAlign: "center",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          Vaccine Care ©{new Date().getFullYear()} Created by Vaccine Care
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
