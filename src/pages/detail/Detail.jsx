import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Detail.scss";
import api from "../../config/axios";

function Detail() {
  const { vaccineId } = useParams();
  const [vaccine, setVaccine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVaccineDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`v1/vaccine/${vaccineId}`);

        if (response.data && response.data.statusCode === 200) {
          // Process manufacturer data correctly
          const vaccineData = response.data.data;
          if (vaccineData.manufacturers && vaccineData.manufacturers.length > 0) {
            vaccineData.manufacturer = vaccineData.manufacturers[0];
          }
          setVaccine(vaccineData);
        } else {
          setError("Không thể tải thông tin vaccine");
        }
      } catch (error) {
        console.error("Error fetching vaccine details:", error);
        setError("Đã xảy ra lỗi khi tải thông tin vaccine");
      } finally {
        setLoading(false);
      }
    };

    if (vaccineId) {
      fetchVaccineDetail();
    }
  }, [vaccineId]);

  if (loading) {
    return <div className="detail-loading">Loading...</div>;
  }

  if (error || !vaccine) {
    return <div className="detail-error">{error || "Không tìm thấy thông tin vaccine"}</div>;
  }

  return (
    <div className="vaccine-detail">
      <div className="vaccine-detail__container">
        <div className="vaccine-detail__image-wrapper">
          <img
            src={vaccine.image}
            alt={vaccine.vaccineName}
            className="vaccine-detail__image"
            onError={(e) => {
              e.target.src = "/placeholder-vaccine.jpg"; // Fallback image
              e.target.onerror = null;
            }}
          />
        </div>
        <div className="vaccine-detail__info">
          <h2 className="vaccine-detail__name">{vaccine.vaccineName}</h2>
          <p className="vaccine-detail__price">Giá: {vaccine.price.toLocaleString("vi-VN")} VND</p>
          <div className="vaccine-detail__section">
            <h3>Thông tin chung</h3>
            {vaccine.description && (
              <>
                <p>
                  <strong>Info: </strong>
                  {vaccine.description.info || "Không có thông tin"}
                </p>
                <p>
                  <strong>Đối tượng tiêm chủng: </strong>
                  {vaccine.description.targetedPatient || "Không có thông tin"}
                </p>
                <p>
                  <strong>Lịch tiêm: </strong>
                  {vaccine.description.injectionSchedule || "Không có thông tin"}
                </p>
                <p>
                  <strong>Tác dụng phụ: </strong>
                  {vaccine.description.vaccineReaction || "Không có thông tin"}
                </p>
              </>
            )}
          </div>
          <div className="vaccine-detail__section">
            <h3>Thông số</h3>
            <p>
              <strong>Độ tuổi: </strong>
              {vaccine.minAge !== undefined && vaccine.maxAge !== undefined
                ? `${vaccine.minAge} - ${vaccine.maxAge} tuổi`
                : "Không có thông tin"}
            </p>
            <p>
              <strong>Số mũi: </strong>
              {vaccine.numberDose || "Không có thông tin"}
            </p>
            <p>
              <strong>Thời gian hiệu lực: </strong>
              {vaccine.duration && vaccine.unit
                ? `${vaccine.duration} ${vaccine.unit === "year" ? "năm" : vaccine.unit}`
                : "Không có thông tin"}
            </p>
          </div>
          <div className="vaccine-detail__section">
            <h3>Nhà sản xuất</h3>
            {vaccine.manufacturer ? (
              <>
                <p>
                  <strong>Tên: </strong>
                  {vaccine.manufacturer.name || "Không có thông tin"}
                </p>
                <p>
                  <strong>Quốc gia: </strong>
                  {vaccine.manufacturer.countryName || "Không có thông tin"}
                </p>
              </>
            ) : (
              <p>Không có thông tin nhà sản xuất</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;
