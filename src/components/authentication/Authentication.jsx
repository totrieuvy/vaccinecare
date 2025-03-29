import "./Authentication.scss";
import HeaderCustomer from "../../components/header/HeaderCustomer";

// eslint-disable-next-line react/prop-types
function Authentication({ children }) {
  return (
    <div style={{ height: "100vh" }}>
      <HeaderCustomer />
      <div className="Authentication">
        <div className="Authentication__left">
          <img
            src="https://cdn.prod.website-files.com/6466101d017ab9d60c8d0137/65df25f0a339915ec6c00de7_Out%20of%20Hospital%20Costs_Savings%20for%20Medical%20Schemes.jpg"
            alt="Authentication"
            className="Authentication__left__logo"
            loading="lazy"
          />
        </div>
        <div className="Authentication__right">{children}</div>
      </div>
    </div>
  );
}

export default Authentication;
