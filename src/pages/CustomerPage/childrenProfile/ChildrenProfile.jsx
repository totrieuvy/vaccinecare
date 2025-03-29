/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../../../config/axios";
import { setSelectedChild } from "../../../redux/features/childrenSelectedSlice";
import "./ChildrenProfile.scss";

function ChildrenProfile() {
  const [children, setChildren] = useState([]);
  const [childDetails, setChildDetails] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user?.userId);
  const userName = useSelector((state) => state.user?.userName);
  const selectedChild = useSelector((state) => state.selectedChild?.selectedChild);

  useEffect(() => {
    document.title = "Thông tin trẻ em";
    if (userId) {
      fetchChildren();
      fetchVaccines();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedChild?.childId) {
      fetchChildDetails(selectedChild.childId);
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
        setError("Không thể lấy dữ liệu trẻ em");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi lấy dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async (childId) => {
    try {
      setDetailsLoading(true);
      const response = await api.get(`user/child/${childId}`);
      if (response.data.statusCode === 200) {
        setChildDetails(response.data.data);
      } else {
        setError("Không thể lấy thông tin chi tiết của trẻ");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi lấy thông tin chi tiết");
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      const response = await api.get("v1/vaccine?pageIndex=1&pageSize=1000");
      if (response.data.statusCode === 200) {
        setVaccines(response.data.data);
      } else {
        setError("Không thể lấy danh sách vaccine");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi lấy danh sách vaccine");
    }
  };

  const handleSelectChild = (child) => {
    dispatch(setSelectedChild(child));
  };

  const ageRanges = [
    { min: 0, max: 12 },
    { min: 12, max: 24 },
    { min: 24, max: 36 },
    { min: 36, max: 48 },
    { min: 48, max: 60 },
    { min: 60, max: 72 },
    { min: 72, max: 84 },
    { min: 84, max: 96 },
  ];

  // Hàm parse chuỗi ngày từ định dạng ISO hoặc custom
  const parseDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString); // Parse ISO format directly
  };

  // Hàm kiểm tra trạng thái tiêm cho từng vaccine
  const getVaccinationStatus = (vaccineName) => {
    if (!childDetails?.vaccinatedInformation || !vaccines.length) return null;

    const vaccineInfo = vaccines.find((v) => v.vaccineName === vaccineName);
    if (!vaccineInfo) return null;

    const vaccinatedCount = childDetails.vaccinatedInformation.filter((v) => v.vaccineName === vaccineName).length;
    const requiredDoses = vaccineInfo.numberDose;

    if (vaccinatedCount === 0) {
      return { status: "Chưa tiêm", doses: `(${requiredDoses} liều)` };
    } else if (vaccinatedCount < requiredDoses) {
      const vaccinatedDates = childDetails.vaccinatedInformation
        .filter((v) => v.vaccineName === vaccineName)
        .map((v) => parseDate(v.actualDate).toLocaleDateString("vi-VN"))
        .join(", ");
      return {
        status: `Đã tiêm ${vaccinatedCount}/${requiredDoses}`,
        dates: vaccinatedDates,
        remaining: `Chưa tiêm (${requiredDoses - vaccinatedCount} liều)`,
      };
    } else {
      const vaccinatedDates = childDetails.vaccinatedInformation
        .filter((v) => v.vaccineName === vaccineName)
        .map((v) => parseDate(v.actualDate).toLocaleDateString("vi-VN"))
        .join(", ");
      return {
        status: "Đã tiêm đủ",
        dates: vaccinatedDates,
      };
    }
  };

  if (!userId) return <div>Vui lòng đăng nhập để xem thông tin</div>;
  if (loading) return <div className="loading-spinner">Đang tải...</div>;
  if (error) return <div className="error-message">Lỗi: {error}</div>;

  return (
    <div className="children-profile-container">
      <h2 className="profile-title">Thông tin trẻ em của {userName}</h2>

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
        <>
          <div className="selected-child-details">
            <h3>Thông tin chi tiết</h3>
            {detailsLoading ? (
              <div className="details-loading">Đang tải thông tin chi tiết...</div>
            ) : (
              <div className="details-card">
                <p>
                  <span>Họ và tên:</span> {childDetails?.data?.fullName || selectedChild.fullName}
                </p>
                <p>
                  <span>Ngày sinh:</span> {childDetails?.data?.dob || selectedChild.dob}
                </p>
                <p>
                  <span>Giới tính:</span> {childDetails?.data?.gender === "male" ? "Nam" : "Nữ"}
                </p>
                <p>
                  <span>Địa chỉ:</span> {childDetails?.data?.address || selectedChild.address || "Chưa cập nhật"}
                </p>
              </div>
            )}
          </div>

          {childDetails && (
            <div className="vaccination-section">
              <h3>Thông tin tiêm chủng</h3>
              {detailsLoading ? (
                <div className="details-loading">Đang tải thông tin tiêm chủng...</div>
              ) : (
                <table className="vaccine-table">
                  <thead>
                    <tr>
                      <th>Vaccine</th>
                      {ageRanges.map((range) => (
                        <th key={`${range.min}-${range.max}`}>
                          {range.min}-{range.max} tháng
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vaccines.map((vaccine) => {
                      // eslint-disable-next-line no-unused-vars
                      const isExactRange = ageRanges.some(
                        (range) => range.min === vaccine.minAge && range.max === vaccine.maxAge
                      );
                      const status = getVaccinationStatus(vaccine.vaccineName);
                      return (
                        <tr key={vaccine.vaccineId}>
                          <td>{vaccine.vaccineName}</td>
                          {ageRanges.map((range) => {
                            const isInRange = range.min === vaccine.minAge && range.max === vaccine.maxAge;
                            return (
                              <td
                                key={`${range.min}-${range.max}`}
                                className={
                                  isInRange && status
                                    ? status.status === "Đã tiêm đủ"
                                      ? "vaccinated"
                                      : "applicable"
                                    : ""
                                }
                              >
                                {isInRange && status ? (
                                  <div>
                                    <p>{status.status}</p>
                                    {status.dates && <p>Ngày: {status.dates}</p>}
                                    {status.remaining && <p>{status.remaining}</p>}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChildrenProfile;
