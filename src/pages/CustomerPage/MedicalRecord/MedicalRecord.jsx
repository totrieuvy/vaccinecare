/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../../../config/axios";
import { setSelectedChild } from "../../../redux/features/childrenSelectedSlice";
import "./MedicalRecord.scss";

function MedicalRecord() {
  const [children, setChildren] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user?.userId);
  const userName = useSelector((state) => state.user?.userName);
  const selectedChild = useSelector((state) => state.selectedChild?.selectedChild);

  useEffect(() => {
    document.title = "Lịch sử tiêm chủng";
    if (userId) {
      fetchChildren();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedChild?.childId) {
      fetchMedicalRecords(selectedChild.childId);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get(`user/${userId}`);
      if (response.data.statusCode === 200 && response.data.data.listChildRes) {
        setChildren(response.data.data.listChildRes);
        if (response.data.data.listChildRes.length > 0 && !selectedChild) {
          dispatch(setSelectedChild(response.data.data.listChildRes[0]));
        }
      } else {
        setError("Không thể lấy danh sách trẻ em");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi lấy danh sách trẻ em");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async (childId) => {
    try {
      setLoading(true);
      const response = await api.get(`payment/details/${childId}`);
      if (response.data.statusCode === 200) {
        setMedicalRecords(response.data.data);
      } else {
        setError("Không thể lấy thông tin lịch tiêm chủng");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi lấy thông tin lịch tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (child) => {
    dispatch(setSelectedChild(child));
  };

  // Hàm parse chuỗi ngày từ định dạng "DD-MM-YYYY HH:mm:ss"
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-");
    const [hours, minutes, seconds] = timePart.split(":");
    // Tạo Date object (tháng trong JavaScript bắt đầu từ 0 nên cần trừ 1)
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  if (!userId) return <div>Vui lòng đăng nhập để xem thông tin</div>;
  if (loading) return <div className="loading-spinner">Đang tải...</div>;
  if (error) return <div className="error-message">Lỗi: {error}</div>;

  return (
    <div className="medical-record-container">
      <h2 className="record-title">Lịch sử tiêm chủng của {userName}</h2>

      {children.length === 0 ? (
        <p className="no-children-message">Không có thông tin trẻ em</p>
      ) : (
        <div className="children-grid">
          {children.map((child) => (
            <div
              key={child.childId}
              className={`child-card ${selectedChild?.childId === child.childId ? "selected" : ""}`}
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
              {selectedChild?.childId === child.childId && <div className="selected-indicator">✓</div>}
            </div>
          ))}
        </div>
      )}

      {selectedChild && (
        <div className="record-section">
          <h3>Lịch tiêm chủng sắp tới</h3>
          {medicalRecords.length === 0 ? (
            <p className="no-record-message">Không có lịch tiêm chủng nào</p>
          ) : (
            <div className="record-grid">
              {medicalRecords.map((record, index) => (
                <div key={index} className="record-card">
                  <h4 className="record-child-name">{record.childName}</h4>
                  <p>
                    <span>Vaccine:</span> {record.vaccineName}
                  </p>
                  <p>
                    <span>Nhà sản xuất:</span> {record.manufacturerName}
                  </p>
                  <div className="vaccinated-dates">
                    <h5>Lịch tiêm</h5>
                    {record.vaccinatedDates.map((date, idx) => (
                      <div key={idx} className="date-entry">
                        <p>
                          <span>Ngày dự kiến:</span> {parseDate(date.scheduleDate).toLocaleDateString("vi-VN")}
                        </p>
                        <p>
                          <span>Ngày thực tế:</span>{" "}
                          {date.actualDate ? (
                            parseDate(date.actualDate).toLocaleDateString("vi-VN")
                          ) : (
                            <span className="pending">Chưa tiêm</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalRecord;
