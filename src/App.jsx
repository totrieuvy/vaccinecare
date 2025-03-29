import { Navigate, Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import CustomerApp from "./layout/Customer/Customer";
import AboutUs from "./pages/CustomerPage/aboutUs/AboutUs";
import NotFoundPage from "./pages/error/NotFoundPage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ForgotPassword from "./pages/forgotPassword/ForgotPassword";
import SideBar from "./components/sidebar/SideBar";
import { useSelector } from "react-redux";
import Vaccine from "./pages/ManagerPage/vaccine/Vaccine";
import TotalAccount from "./pages/AdminPage/totalAccount/TotalAccount";
import Manager from "./pages/AdminPage/manager/Manager";
import Staff from "./pages/ManagerPage/staff/Staff";
import Manufacture from "./pages/ManagerPage/manufacture/Manufacture";
import TotalRevenue from "./pages/AdminPage/revenue/TotalRevenue";
import RegisterSchedule from "./pages/CustomerPage/RegisterSchedule/RegisterSchedule";
import HomePage from "./pages/CustomerPage/HomePage/HomePage";
import TotalVaccine from "./pages/AdminPage/totalVaccine/TotalVaccine";
import PackageVaccine from "./pages/ManagerPage/packageVaccine/PackageVaccine";
import Detail from "./pages/detail/Detail";
import VaccineDisplay from "./pages/CustomerPage/VaccineInfo/VaccineDisplay";
import VaccineDetail from "./pages/CustomerPage/VaccineInfo/VaccineDetail";
import Batch from "./pages/ManagerPage/batch/Batch";
import RegisterChildren from "./pages/CustomerPage/registerChildren/register/RegisterChildren";
import ChildrenProfile from "./pages/CustomerPage/childrenProfile/ChildrenProfile";
import StaffPage from "./pages/StaffPage/StaffPage";
import DoctorPage from "./pages/DoctorPage/DoctorPage";
import PaymentSuccess from "./components/paymentSuccess/PaymentSuccess";
import ResetPassword from "./pages/CustomerPage/resetPassword/ResetPassword";
import MedicalRecord from "./pages/CustomerPage/MedicalRecord/MedicalRecord";
import ChatRoom from "./components/Chat";
import MainLayout from "./pages/CustomerPage/HomePage/MainLayout";
import PaymentFailed from "./components/paymentSuccess/PaymentFailed";

const PrivateRoute = ({ roleName }) => {
  const user = useSelector((state) => state?.user);
  const isAuthenticated = !!user?.token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roleName && roleName !== user?.roleName) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const App = () => {
  const router = createBrowserRouter([
    {
      path: "*",
      element: <NotFoundPage />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      element: <MainLayout />, // Bao bọc tất cả các route chính bằng MainLayout
      children: [
        {
          path: "/sidebar",
          element: <SideBar />,
        },
        {
          path: "/",
          element: <CustomerApp />,
          children: [
            {
              index: true,
              element: <HomePage />,
            },
            {
              path: "detail/:vaccineId",
              element: <Detail />,
            },
            {
              path: "payment-success",
              element: <PaymentSuccess />,
            },
            {
              path: "payment-cancel",
              element: <PaymentFailed />,
            },
            {
              path: "children-profile",
              element: <ChildrenProfile />,
            },
            {
              path: "medical-records",
              element: <MedicalRecord />,
            },
            {
              path: "about-us",
              element: <AboutUs />,
            },
            {
              path: "register-schedule",
              element: <RegisterSchedule />,
            },
            {
              path: "register-children",
              element: <RegisterChildren />,
            },
            {
              path: "vaccination",
              element: <VaccineDisplay />,
            },
            {
              path: "/vaccination/:vaccineId",
              element: <VaccineDetail />,
            },
          ],
        },
        {
          path: "admin",
          element: <PrivateRoute roleName="admin" />,
          children: [
            {
              path: "",
              element: <SideBar />,
              children: [
                {
                  path: "dashboard/total-account",
                  element: <TotalAccount />,
                },
                {
                  path: "chat",
                  element: <ChatRoom />,
                },
                {
                  path: "dashboard/total-vaccine",
                  element: <TotalVaccine />,
                },
                {
                  path: "manager",
                  element: <Manager />,
                },
                {
                  path: "dashboard/total-revenue",
                  element: <TotalRevenue />,
                },
                {
                  path: "category",
                  element: <div>dashboard</div>,
                },
              ],
            },
          ],
        },
        {
          path: "manager",
          element: <PrivateRoute roleName="manager" />,
          children: [
            {
              path: "",
              element: <SideBar />,
              children: [
                {
                  path: "vaccine",
                  element: <Vaccine />,
                },
                {
                  path: "chat",
                  element: <ChatRoom />,
                },
                {
                  path: "batch",
                  element: <Batch />,
                },
                {
                  path: "package-vaccine",
                  element: <PackageVaccine />,
                },
                {
                  path: "manufacture",
                  element: <Manufacture />,
                },
                {
                  path: "staff",
                  element: <Staff />,
                },
                {
                  path: "product",
                  element: <div>dashboard</div>,
                },
                {
                  path: "category",
                  element: <div>dashboard</div>,
                },
              ],
            },
          ],
        },
        {
          path: "/staff",
          element: <PrivateRoute roleName="staff" />,
          children: [
            {
              path: "",
              element: <StaffPage />,
            },
          ],
        },
        {
          path: "/doctor",
          element: <PrivateRoute roleName="doctor" />,
          children: [
            {
              path: "",
              element: <DoctorPage />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
