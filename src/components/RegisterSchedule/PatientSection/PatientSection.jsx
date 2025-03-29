/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Card } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedVaccinatedChild } from "../../../redux/features/selectedVaccinatedChildren";
import api from "../../../config/axios";
import "./PatientSection.scss";

const PatientSection = () => {
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState(null);

  // Redux
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user?.userId);
  const userName = useSelector((state) => state.user?.userName);
  const selectedVaccinatedChild = useSelector((state) => state.selectedVaccinatedChild?.selectedChild);

  useEffect(() => {
    if (userId) {
      fetchChildren();
    }
  }, [userId]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get(`user/${userId}`);

      if (response.data.statusCode === 200 && response.data.data.listChildRes) {
        setChildren(response.data.data.listChildRes);

        // Select first child if none is selected
        if (response.data.data.listChildRes.length > 0 && !selectedVaccinatedChild) {
          dispatch(setSelectedVaccinatedChild(response.data.data.listChildRes[0]));
        }
      } else {
        setError("Không thể lấy dữ liệu trẻ em");
      }
    } catch (err) {
      console.error("Error fetching children:", err);
      setError(err.message || "Đã xảy ra lỗi khi lấy dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (child) => {
    dispatch(setSelectedVaccinatedChild(child));
  };

  if (!userId) return <div>Vui lòng đăng nhập để xem thông tin</div>;
  if (loading) return <div className="loading-spinner">Đang tải...</div>;
  if (error) return <div className="error-message">Lỗi: {error}</div>;

  return (
    <Card
      title="Thông tin bệnh nhân"
      className="max-w-6xl mx-auto mb-4"
      headStyle={{
        backgroundColor: "#65558F",
        color: "#ffffff",
      }}
    >
      <div className="children-profile-container">
        <h2 className="profile-title">Chọn bệnh nhân của {userName}</h2>

        {children.length === 0 ? (
          <p className="no-children-message">Không có thông tin trẻ em</p>
        ) : (
          <div className="children-grid">
            {children.map((child) => (
              <div
                key={child.childId}
                className={`child-card ${selectedVaccinatedChild?.childId === child.childId ? "selected" : ""}`}
                onClick={() => handleSelectChild(child)}
              >
                <div className="child-avatar">
                  {child.gender === "male" ? (
                    <div className="avatar-icon male">👦</div>
                  ) : (
                    <div className="avatar-icon female">👧</div>
                  )}
                </div>
                <div className="child-info">
                  <h3 className="child-name">{child.fullName}</h3>
                  <div className="child-details">
                    <p>
                      <span>Ngày sinh:</span> {child.dob}
                    </p>
                    <p>
                      <span>Giới tính:</span> {child.gender === "male" ? "Nam" : "Nữ"}
                    </p>
                  </div>
                </div>
                {selectedVaccinatedChild?.childId === child.childId && (
                  <div className="selected-indicator">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12L10 17L19 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedVaccinatedChild && (
          <div className="selected-child-details">
            <h3>Thông tin chi tiết</h3>
            <div className="details-card">
              <p>
                <span>Họ và tên:</span> {selectedVaccinatedChild.fullName}
              </p>
              <p>
                <span>Ngày sinh:</span> {selectedVaccinatedChild.dob}
              </p>
              <p>
                <span>Giới tính:</span> {selectedVaccinatedChild.gender === "male" ? "Nam" : "Nữ"}
              </p>
              <p>
                <span>Địa chỉ:</span> {selectedVaccinatedChild.address}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PatientSection;
