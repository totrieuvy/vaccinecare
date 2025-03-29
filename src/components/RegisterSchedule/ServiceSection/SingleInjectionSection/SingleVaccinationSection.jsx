import { useEffect, useState } from "react";
import { Form, Row, Col, DatePicker, message, Space, Tag, List, Typography, Empty } from "antd";
import api from "../../../../config/axios";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import "./VaccinationSection.scss";

const { Title, Text } = Typography;

const VaccinationSection = () => {
  const [selectedVaccines, setSelectedVaccines] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [vaccinationDate, setVaccinationDate] = useState(null);
  const [scheduledVaccines, setScheduledVaccines] = useState([]);
  const [temporarySchedules, setTemporarySchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateSelectionLoading, setDateSelectionLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const selectedVaccinatedChild = useSelector((state) => state.selectedVaccinatedChild.selectedChild);
  const childId = selectedVaccinatedChild?.childId || "";
  const childName = selectedVaccinatedChild?.fullName || "";
  const childDob = selectedVaccinatedChild?.dob || "";
  const childGender = selectedVaccinatedChild?.gender || "";
  const childAddress = selectedVaccinatedChild?.address || "";
  const childAge = childDob ? calculateChildAgeInMonths(childDob) : null;

  const user = useSelector((state) => state.user);
  const userId = user?.userId || "";

  function calculateChildAgeInMonths(dobString) {
    if (!dobString) return null;
    const dob = dayjs(dobString);
    return dayjs().diff(dob, "month", true);
  }

  const fetchVaccines = async () => {
    if (!childId) return;

    try {
      setLoading(true);
      const response = await api.get("v1/vaccine?pageIndex=1&pageSize=10000");

      if (response.data && response.data.data) {
        const validVaccines = response.data.data.filter(
          (vaccine) => vaccine.minAge !== null && vaccine.maxAge !== null && vaccine.minAge >= 0 && vaccine.maxAge <= 96
        );
        setVaccines(validVaccines);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách vắc-xin:", error);
      message.error("Không thể tải danh sách vắc-xin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
    setSelectedVaccines([]);
    setVaccinationDate(null);
    setScheduledVaccines([]);
    setTemporarySchedules([]);
    setPaymentMethod(null);

    if (childAge !== null) {
      const relevantGroups = {};
      Object.keys(groupVaccinesByAge()).forEach((ageRange) => {
        const [minAge, maxAge] = ageRange.split(" - ").map((age) => parseFloat(age));
        if (childAge >= minAge && childAge <= maxAge) {
          relevantGroups[ageRange] = true;
        }
      });
      setExpandedGroups(relevantGroups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const handleCheckboxChange = (vaccineId) => {
    setSelectedVaccines((prev) => {
      const newSelection = prev.includes(vaccineId) ? prev.filter((id) => id !== vaccineId) : [...prev, vaccineId];
      setTemporarySchedules([]);
      return newSelection;
    });
  };

  const handleDateChange = async (date) => {
    const formattedDate = date ? date.format("YYYY-MM-DD") : null;
    setVaccinationDate(formattedDate);

    if (!formattedDate) {
      setTemporarySchedules([]);
      return;
    }

    if (selectedVaccines.length === 0) {
      message.warning("Vui lòng chọn ít nhất một vắc-xin trước");
      return;
    }

    await fetchTemporarySchedules(formattedDate);
  };

  const fetchTemporarySchedules = async (date) => {
    if (!childId || selectedVaccines.length === 0 || !date) return;

    try {
      setDateSelectionLoading(true);
      const scheduleRequest = { vaccineIds: selectedVaccines, childId, startDate: date };
      const response = await api.post("schedule", [scheduleRequest]);

      if (response.data && response.data.code === "Success") {
        setTemporarySchedules(response.data.data || []);
        message.success("Đã tạo xem trước lịch tiêm chủng");
      } else {
        message.error("Không thể tạo xem trước lịch tiêm chủng");
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch trình tạm thời:", error);
      message.error(error.response?.data?.message || "Đã xảy ra lỗi khi tải lịch trình tạm thời");
    } finally {
      setDateSelectionLoading(false);
    }
  };

  const calculateTotal = () => {
    return vaccines
      .filter((vaccine) => selectedVaccines.includes(vaccine.vaccineId))
      .reduce((sum, vaccine) => sum + (vaccine.price || 0), 0);
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    return date.format("DD-MM-YYYY");
  };

  const submitSchedule = async () => {
    if (!childId) {
      message.error("Chưa chọn trẻ. Vui lòng chọn trẻ trước.");
      return;
    }
    if (!userId) {
      message.error("Thông tin người dùng không khả dụng. Vui lòng đăng nhập lại.");
      return;
    }
    if (selectedVaccines.length === 0) {
      message.warning("Vui lòng chọn ít nhất một vắc-xin");
      return;
    }
    if (!vaccinationDate) {
      message.warning("Vui lòng chọn ngày tiêm chủng");
      return;
    }
    if (!paymentMethod) {
      message.warning("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setLoading(true);
      const formattedInjectionDate = formatDateForAPI(vaccinationDate);
      const orderPayload = {
        userId,
        childId,
        fullName: childName,
        dob: childDob,
        gender: childGender,
        address: childAddress,
        injectionDate: formattedInjectionDate,
        amount: calculateTotal(),
        vaccineIdList: selectedVaccines,
        paymentMethod: paymentMethod,
      };

      console.log("Payload đơn hàng:", orderPayload);
      const orderResponse = await api.post("order", orderPayload);

      if (orderResponse.data && orderResponse.data.code === "Success") {
        message.success("Đã tạo đơn hàng tiêm chủng thành công");
        if (orderResponse.data.data) {
          window.location.href = orderResponse.data.data;
          return;
        }

        const scheduleRequest = { vaccineIds: selectedVaccines, childId, startDate: vaccinationDate };
        const scheduleResponse = await api.post("schedule", [scheduleRequest]);

        if (scheduleResponse.data && scheduleResponse.data.code === "Success") {
          message.success("Đã tạo lịch tiêm chủng thành công");
          setScheduledVaccines(scheduleResponse.data.data || []);
          setTemporarySchedules([]);
          setSelectedVaccines([]);
          setVaccinationDate(null);
          setPaymentMethod(null);
        } else {
          message.error("Không thể lên lịch tiêm chủng");
        }
      } else {
        message.error("Không thể tạo đơn hàng tiêm chủng");
      }
    } catch (error) {
      console.error("Lỗi khi xử lý yêu cầu tiêm chủng:", error);
      message.error(error.response?.data?.message || "Đã xảy ra lỗi khi xử lý yêu cầu của bạn");
    } finally {
      setLoading(false);
    }
  };

  const groupVaccinesByAge = () => {
    return vaccines.reduce((groups, vaccine) => {
      const ageGroup = `${vaccine.minAge} - ${vaccine.maxAge}`;
      if (!groups[ageGroup]) groups[ageGroup] = [];
      groups[ageGroup].push(vaccine);
      return groups;
    }, {});
  };

  const getVaccineGroups = () => {
    const vaccineGroups = groupVaccinesByAge();
    return Object.entries(vaccineGroups).sort((a, b) => {
      const minAgeA = parseFloat(a[0].split(" - ")[0].trim());
      const minAgeB = parseFloat(b[0].split(" - ")[0].trim());
      return minAgeA - minAgeB;
    });
  };

  const toggleGroup = (ageGroup) => {
    setExpandedGroups((prev) => ({ ...prev, [ageGroup]: !prev[ageGroup] }));
  };

  const formatTotalPrice = () => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
      calculateTotal()
    );
  };

  const getSelectedVaccineDetails = () => {
    return vaccines.filter((vaccine) => selectedVaccines.includes(vaccine.vaccineId));
  };

  const getManufacturerInfo = (vaccine, field) => {
    const manufacturer = vaccine.manufacturers && vaccine.manufacturers[0];
    if (!manufacturer) return "Không xác định";
    switch (field) {
      case "name":
        return manufacturer.name || "Không xác định";
      case "countryName":
        return manufacturer.countryName || "Không xác định";
      default:
        return "Không xác định";
    }
  };

  const isVaccineAppropriateForChild = (vaccine) => {
    if (childAge === null) return false;
    return childAge >= vaccine.minAge && childAge <= vaccine.maxAge;
  };

  const formatMonthRangeToDisplay = (minMonth, maxMonth) => {
    if (minMonth === 0 && maxMonth < 12) {
      return `${maxMonth} tháng đầu`;
    } else {
      return `${minMonth} - ${maxMonth} tháng`;
    }
  };

  const renderVaccineCard = (vaccine) => (
    <Col xs={24} sm={12} md={8} lg={8} key={vaccine.vaccineId}>
      <div className={`vaccine-card ${isVaccineAppropriateForChild(vaccine) ? "vaccine-card--appropriate" : ""}`}>
        <img className="vaccine-card__image" alt={vaccine.vaccineName} src={vaccine.image} />
        <div className="vaccine-card__content">
          <div className="vaccine-card__header">
            <input
              type="checkbox"
              checked={selectedVaccines.includes(vaccine.vaccineId)}
              onChange={() => handleCheckboxChange(vaccine.vaccineId)}
              className="vaccine-card__checkbox"
            />
            <div className="vaccine-card__title-wrapper">
              <div className="vaccine-card__title">
                {vaccine.vaccineName} ({getManufacturerInfo(vaccine, "name")})
              </div>
              {isVaccineAppropriateForChild(vaccine) && (
                <Tag color="green" className="vaccine-card__appropriate-tag">
                  Phù hợp với độ tuổi trẻ
                </Tag>
              )}
            </div>
          </div>
          <div className="vaccine-card__description">{vaccine.description?.info || "Không có thông tin"}</div>
          <div className="vaccine-card__origin">
            Nguồn gốc: {getManufacturerInfo(vaccine, "name")} ({getManufacturerInfo(vaccine, "countryName")})
          </div>
          <div className="vaccine-card__price">{new Intl.NumberFormat("vi-VN").format(vaccine.price)} đ</div>
        </div>
      </div>
    </Col>
  );

  const renderSelectedVaccinesList = () => {
    const selectedVaccineDetails = getSelectedVaccineDetails();
    const vnpayImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1v7T287-ikP1m7dEUbs2n1SbbLEqkMd1ZA&s";
    const momoImage =
      "https://play-lh.googleusercontent.com/uCtnppeJ9ENYdJaSL5av-ZL1ZM1f3b35u9k8EOEjK3ZdyG509_2osbXGH5qzXVmoFv0";

    return (
      <div className="selected-vaccines">
        <div className="selected-vaccines__header">DANH SÁCH VẮC XIN CHỌN MUA</div>
        {childName && <div className="selected-vaccines__child-name">Trẻ: {childName}</div>}
        {childAge !== null && <div className="selected-vaccines__child-age">Tuổi: {childAge.toFixed(1)} tháng</div>}

        {selectedVaccineDetails.length === 0 ? (
          <div className="selected-vaccines__empty">Chưa chọn vắc-xin nào</div>
        ) : (
          <>
            <div className="selected-vaccines__list">
              {selectedVaccineDetails.map((vaccine) => (
                <div key={vaccine.vaccineId} className="selected-vaccines__item">
                  <div className="selected-vaccines__item-header">
                    <div>
                      <div className="selected-vaccines__item-title">
                        {vaccine.vaccineName} ({getManufacturerInfo(vaccine, "name")})
                      </div>
                      <div className="selected-vaccines__item-origin">
                        Nguồn gốc: {getManufacturerInfo(vaccine, "name")} ({getManufacturerInfo(vaccine, "countryName")}
                        )
                      </div>
                    </div>
                    <button
                      className="selected-vaccines__item-remove"
                      onClick={() => handleCheckboxChange(vaccine.vaccineId)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="selected-vaccines__item-price">
                    {new Intl.NumberFormat("vi-VN").format(vaccine.price)} VND
                  </div>
                </div>
              ))}
            </div>
            <div className="selected-vaccines__date-picker">
              <label className="selected-vaccines__date-label">Ngày bắt đầu chích:</label>
              <DatePicker
                placeholder="Chọn ngày tiêm chủng"
                className="selected-vaccines__date-input"
                onChange={handleDateChange}
                value={vaccinationDate ? dayjs(vaccinationDate) : null}
                disabled={selectedVaccines.length === 0 || dateSelectionLoading}
              />
              {dateSelectionLoading && (
                <div className="selected-vaccines__loading">Đang tải xem trước lịch trình...</div>
              )}
            </div>
            <div className="selected-vaccines__payment-method">
              <label className="selected-vaccines__payment-label">Phương thức thanh toán:</label>
              <Space>
                <div
                  className={`payment-option ${paymentMethod === "vnpay" ? "payment-option--selected" : ""}`}
                  onClick={() => !loading && setPaymentMethod("vnpay")}
                >
                  <img src={vnpayImage} alt="VNPAY" className="payment-image" />
                </div>
                <div
                  className={`payment-option ${paymentMethod === "momo" ? "payment-option--selected" : ""}`}
                  onClick={() => !loading && setPaymentMethod("momo")}
                >
                  <img src={momoImage} alt="Momo" className="payment-image" />
                </div>
              </Space>
            </div>
            <div className="selected-vaccines__total">
              <span className="selected-vaccines__total-label">Tổng cộng:</span>
              <span className="selected-vaccines__total-amount">{formatTotalPrice()}</span>
            </div>
            <button
              className="selected-vaccines__button"
              onClick={submitSchedule}
              disabled={
                !childId || !userId || selectedVaccines.length === 0 || !vaccinationDate || !paymentMethod || loading
              }
            >
              {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ MŨI TIÊM"}
            </button>
          </>
        )}
      </div>
    );
  };

  const renderTemporarySchedules = () => {
    if (temporarySchedules.length === 0) return null;

    const groupedByType = temporarySchedules.reduce((acc, schedule) => {
      if (!acc[schedule.vaccineType]) acc[schedule.vaccineType] = [];
      acc[schedule.vaccineType].push(schedule);
      return acc;
    }, {});

    return (
      <div className="temporary-schedules">
        <div className="temporary-schedules__header">Lịch Tiêm Chủng Dự Kiến</div>
        <div className="temporary-schedules__note">
          Lịch trình bên dưới là dự kiến. Nhấn ĐĂNG KÝ MŨI TIÊM để xác nhận.
        </div>
        {Object.entries(groupedByType).map(([vaccineType, schedules]) => (
          <div key={vaccineType} className="temporary-schedules__type-group">
            <List
              dataSource={schedules}
              renderItem={(item) => (
                <List.Item className="temporary-schedules__list-item">
                  <Space direction="vertical" className="temporary-schedules__item-details">
                    <Text className="temporary-schedules__date">
                      Ngày tiêm: {dayjs(item.scheduleDate).format("DD/MM/YYYY")}
                    </Text>
                    <Space>
                      <Text>Trạng thái:</Text>
                      <Tag color="blue" className="temporary-schedules__status-tag">
                        Dự kiến
                      </Tag>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderScheduledVaccines = () => {
    if (scheduledVaccines.length === 0) return null;

    const groupedByType = scheduledVaccines.reduce((acc, vaccine) => {
      if (!acc[vaccine.vaccineType]) acc[vaccine.vaccineType] = [];
      acc[vaccine.vaccineType].push(vaccine);
      return acc;
    }, {});

    return (
      <div className="scheduled-vaccines">
        <div className="scheduled-vaccines__header">Lịch Tiêm Chủng Đã Đăng Ký</div>
        {Object.entries(groupedByType).map(([vaccineType, vaccines]) => (
          <div key={vaccineType} className="scheduled-vaccines__type-group">
            <Title level={5} className="scheduled-vaccines__type-title">
              {vaccineType}
            </Title>
            <List
              dataSource={vaccines}
              renderItem={(item) => (
                <List.Item className="scheduled-vaccines__list-item">
                  <Space direction="vertical" className="scheduled-vaccines__item-details">
                    <Text className="scheduled-vaccines__date">
                      Ngày tiêm: {dayjs(item.scheduleDate).format("DD/MM/YYYY")}
                    </Text>
                    <Space>
                      <Text>Trạng thái:</Text>
                      <Tag
                        color={item.scheduleStatus === "Pending" ? "orange" : "green"}
                        className="scheduled-vaccines__status-tag"
                      >
                        {item.scheduleStatus === "Pending" ? "Chờ tiêm" : "Đã tiêm"}
                      </Tag>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        ))}
      </div>
    );
  };

  if (!childId) {
    return (
      <div className="vaccination-section">
        <div className="empty-state">
          <Empty description="Vui lòng chọn trẻ để xem các tùy chọn tiêm chủng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </div>
    );
  }

  return (
    <div className="vaccination-section">
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Form.Item label="Tiêm chủng" className="mt-4">
            {loading ? (
              <div className="loading-state">Đang tải danh sách vắc-xin...</div>
            ) : (
              <>
                {childAge !== null && (
                  <div className="child-age-info">
                    <Tag color="blue">Tuổi trẻ: {childAge.toFixed(1)} tháng</Tag>
                    <p className="age-appropriate-notice">
                      Vắc-xin phù hợp với độ tuổi của trẻ được đánh dấu và mở rộng mặc định.
                    </p>
                  </div>
                )}
                {getVaccineGroups().map(([ageRange, vaccinesInGroup]) => {
                  const [minAge, maxAge] = ageRange.split(" - ").map(parseFloat);
                  const displayRange = formatMonthRangeToDisplay(minAge, maxAge);

                  return (
                    <div key={ageRange} className="age-group">
                      <div className="age-group__header" onClick={() => toggleGroup(ageRange)}>
                        <div className="age-group__header-text">
                          <span className={`icon ${expandedGroups[ageRange] ? "icon--expanded" : ""}`}>
                            {expandedGroups[ageRange] ? "▲" : "▼"}
                          </span>
                          Vắc-xin cho trẻ {displayRange}
                          {childAge !== null && childAge >= minAge && childAge <= maxAge && (
                            <Tag color="green" className="age-group__appropriate-tag">
                              Khuyến nghị cho trẻ của bạn
                            </Tag>
                          )}
                        </div>
                      </div>
                      {expandedGroups[ageRange] && (
                        <div className="age-group__content">
                          <Row gutter={[16, 16]}>{vaccinesInGroup.map((vaccine) => renderVaccineCard(vaccine))}</Row>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </Form.Item>
        </Col>
        <Col xs={24} md={8} className="vaccines-sidebar">
          <div className="sidebar-content">
            {renderSelectedVaccinesList()}
            {renderTemporarySchedules()}
            {renderScheduledVaccines()}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default VaccinationSection;
