import "./NotFoundPage.scss";
import { WarningOutlined } from "@ant-design/icons";

function NotFoundPage() {
  return (
    <div className="NotFound">
      <div className="NotFound__content">
        <WarningOutlined className="NotFound__content__icon" />
        <h2>404 - Page not found</h2>
        <h4>The page you are looking for does not exist.</h4>
      </div>
    </div>
  );
}

export default NotFoundPage;
