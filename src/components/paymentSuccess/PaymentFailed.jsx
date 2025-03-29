import { useState, useEffect } from "react";
import "./PaymentFailed.scss"; // Bạn có thể tạo file SCSS riêng cho trang này
import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const [showErrorAnimation, setShowErrorAnimation] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowErrorAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="payment-failed-container">
      {showErrorAnimation && (
        <div className="error-animation-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="error-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(0, 80%, ${Math.random() * 40 + 30}%)`, // Màu đỏ nhạt
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                animationDuration: `${Math.random() * 2 + 1}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="failed-card">
        <div className="failed-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        <h2 className="failed-title">Thanh toán thất bại!</h2>
        <p className="failed-message">
          Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.
        </p>

        <div className="button-group">
          <button
            className="btn btn-retry"
            onClick={() => {
              navigate("/payment"); // Điều hướng về trang thanh toán để thử lại
            }}
          >
            Thử lại
          </button>
          <button
            className="btn btn-home"
            onClick={() => {
              navigate("/");
            }}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
