import { Outlet } from "react-router-dom";
import "./AutoAlign-Header-Footer.css";
import FooterCustomer from "../../components/footer/FooterCustomer";
import HeaderCustomer from "../../components/header/HeaderCustomer";

function CustomerApp() {
  return (
    <div className="Header-Footer">
      <HeaderCustomer />
      <main className="autoAllign-Header-Footer">
        <Outlet />
      </main>
      <FooterCustomer />
    </div>
  );
}

export default CustomerApp;
