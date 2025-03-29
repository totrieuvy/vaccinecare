import { useEffect, useState } from "react";
import {
  Form,
  Card,
  Row,
  Col,
  Checkbox,
  Collapse,
  DatePicker,
  Button,
  Modal,
  Table,
  message,
  Tag,
  List,
  Spin,
  Image,
  Space,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../../config/axios";
import {
  selectPackage,
  replaceVaccine,
  setVaccinationDate,
  resetPackageSelection,
} from "../../../../redux/features/selectedPackageSlice";
import dayjs from "dayjs";
import "./VaccinationPackageSection.scss";

const { Panel } = Collapse;

const VaccinationPackageSection = () => {
  const dispatch = useDispatch();
  const selectedPackage = useSelector((state) => state.selectedPackage);
  const selectedVaccinatedChild = useSelector((state) => state.selectedVaccinatedChild.selectedChild);
  const user = useSelector((state) => state.user);

  const [packages, setPackages] = useState([]);
  const [allVaccines, setAllVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vaccineModalVisible, setVaccineModalVisible] = useState(false);
  const [currentVaccine, setCurrentVaccine] = useState(null);
  const [alternativeVaccines, setAlternativeVaccines] = useState([]);
  const [temporarySchedules, setTemporarySchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // New state for payment method

  const childId = selectedVaccinatedChild?.childId || "";
  const childName = selectedVaccinatedChild?.fullName || "";
  const childDob = selectedVaccinatedChild?.dob || "";
  const childGender = selectedVaccinatedChild?.gender || "";
  const childAddress = selectedVaccinatedChild?.address || "";
  const childAge = childDob ? calculateChildAge(childDob) : null;

  const userId = user?.userId || "";

  const vnpayImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1v7T287-ikP1m7dEUbs2n1SbbLEqkMd1ZA&s";
  const momoImage =
    "https://play-lh.googleusercontent.com/uCtnppeJ9ENYdJaSL5av-ZL1ZM1f3b35u9k8EOEjK3ZdyG509_2osbXGH5qzXVmoFv0";

  function calculateChildAge(dobString) {
    if (!dobString) return null;
    const dob = dayjs(dobString);
    return dayjs().diff(dob, "month");
  }

  useEffect(() => {
    fetchPackages();
    fetchAllVaccines();
  }, []);

  useEffect(() => {
    if (childId) {
      dispatch(resetPackageSelection());
      setTemporarySchedules([]);
      setPaymentMethod(null); // Reset payment method when child changes
    }
  }, [childId, dispatch]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get("v1/package");
      if (response.data && response.data.data) {
        const validPackages = response.data.data.filter(
          (pkg) => pkg.minAge !== null && pkg.maxAge !== null && pkg.minAge >= 0 && pkg.maxAge <= 96
        );
        setPackages(validPackages);
      }
    } catch (error) {
      console.error("Lỗi khi tải gói tiêm chủng:", error);
      message.error("Không thể tải gói tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVaccines = async () => {
    try {
      const response = await api.get("v1/vaccine?pageIndex=1&pageSize=10000");
      if (response.data && response.data.data) {
        setAllVaccines(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải tất cả vắc-xin:", error);
      message.error("Không thể tải các lựa chọn vắc-xin thay thế");
    }
  };

  const handlePackageSelect = (pkg) => {
    if (selectedPackage.packageId === pkg.packageId) {
      dispatch(resetPackageSelection());
      setPaymentMethod(null); // Reset payment method when package is deselected
    } else {
      dispatch(
        selectPackage({
          packageId: pkg.packageId,
          packageName: pkg.packageName,
          price: pkg.price,
          vaccines: pkg.vaccines || [],
        })
      );
      setTemporarySchedules([]);
    }
  };

  const openVaccineAlternatives = (vaccine) => {
    setCurrentVaccine(vaccine);
    const alternatives = allVaccines.filter(
      (v) => v.vaccineName === vaccine.vaccineName && v.vaccineId !== vaccine.vaccineId
    );
    setAlternativeVaccines(alternatives);
    setVaccineModalVisible(true);
  };

  const handleVaccineReplace = (newVaccine) => {
    if (currentVaccine) {
      dispatch(
        replaceVaccine({
          originalVaccineId: currentVaccine.vaccineId,
          newVaccine: newVaccine,
        })
      );
      message.success(
        `Đã thay thế vắc-xin bằng phiên bản ${newVaccine.manufacturers[0]?.name} (${newVaccine.manufacturers[0]?.countryCode})`
      );
      setVaccineModalVisible(false);
      setTemporarySchedules([]);
    }
  };

  const handleDateChange = async (date) => {
    const formattedDate = date ? date.format("YYYY-MM-DD") : null;
    dispatch(setVaccinationDate(formattedDate));

    if (!formattedDate) {
      setTemporarySchedules([]);
      return;
    }

    if (!selectedPackage.packageId) {
      message.warning("Vui lòng chọn gói tiêm chủng trước");
      return;
    }

    await fetchTemporarySchedules(formattedDate);
  };

  const fetchTemporarySchedules = async (date) => {
    if (!childId || !selectedPackage.packageId || !date) return;

    try {
      setScheduleLoading(true);
      const vaccineIds = selectedPackage.selectedVaccines.map((vaccine) => vaccine.vaccineId);
      const scheduleRequest = { vaccineIds, childId, startDate: date };
      const response = await api.post("schedule", [scheduleRequest]);

      if (response.data && response.data.code === "Success") {
        setTemporarySchedules(response.data.data || []);
        message.success("Đã tạo xem trước lịch tiêm chủng");
      } else {
        message.error("Không thể tạo xem trước lịch tiêm chủng");
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch tạm thời:", error);
      message.error(error.response?.data?.message || "Đã xảy ra lỗi khi tải lịch tiêm chủng tạm thời");
    } finally {
      setScheduleLoading(false);
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  const handleSubmitVaccination = () => {
    if (!childId || !selectedPackage.packageId || !selectedPackage.vaccinationDate) {
      message.warning("Vui lòng chọn gói tiêm chủng và ngày tiêm trước");
      return;
    }
    if (!paymentMethod) {
      message.warning("Vui lòng chọn phương thức thanh toán");
      return;
    }
    setConfirmModalVisible(true);
  };

  const confirmVaccination = async () => {
    try {
      setLoading(true);
      const vaccineIds = selectedPackage.selectedVaccines.map((vaccine) => vaccine.vaccineId);
      const formattedInjectionDate = formatDateForAPI(selectedPackage.vaccinationDate);
      const orderPayload = {
        userId,
        childId,
        fullName: childName,
        dob: childDob,
        gender: childGender,
        address: childAddress,
        injectionDate: formattedInjectionDate,
        amount: calculateTotalPrice(),
        vaccineIdList: vaccineIds,
        paymentMethod: paymentMethod, // Include payment method in payload
      };

      const orderResponse = await api.post("order", orderPayload);
      if (orderResponse.data && orderResponse.data.code === "Success") {
        message.success("Đã tạo đơn hàng tiêm chủng thành công");
        if (orderResponse.data.data) {
          window.location.href = orderResponse.data.data;
          return;
        }

        const scheduleRequest = { vaccineIds, childId, startDate: selectedPackage.vaccinationDate };
        const scheduleResponse = await api.post("schedule", [scheduleRequest]);

        if (scheduleResponse.data && scheduleResponse.data.code === "Success") {
          message.success("Đã tạo lịch tiêm chủng thành công");
          dispatch(resetPackageSelection());
          setTemporarySchedules([]);
          setPaymentMethod(null); // Reset payment method after success
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
      setConfirmModalVisible(false);
    }
  };

  const groupPackagesByAge = () => {
    return packages.reduce((groups, pkg) => {
      if (pkg.minAge === null || pkg.maxAge === null) return groups;
      const ageGroup = `${pkg.minAge} - ${pkg.maxAge}`;
      if (!groups[ageGroup]) groups[ageGroup] = [];
      groups[ageGroup].push(pkg);
      return groups;
    }, {});
  };

  const sortedPackageGroups = () => {
    const packageGroups = groupPackagesByAge();
    return Object.entries(packageGroups).sort(([a], [b]) => {
      const minAgeA = parseInt(a.split("-")[0].trim(), 10);
      const minAgeB = parseInt(b.split("-")[0].trim(), 10);
      return minAgeA - minAgeB;
    });
  };

  const calculateTotalPrice = () => {
    if (!selectedPackage.packageId) return 0;
    const packageInfo = packages.find((pkg) => pkg.packageId === selectedPackage.packageId);
    if (!packageInfo) return 0;

    let totalVaccinePrice = selectedPackage.selectedVaccines.reduce((sum, vaccine) => sum + vaccine.price, 0);
    let discountAmount = packageInfo.discount ? (totalVaccinePrice * packageInfo.discount) / 100 : 0;
    const finalPrice = totalVaccinePrice - discountAmount;
    return finalPrice > 0 ? finalPrice : 0;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
      price
    );
  };

  const isPackageAppropriateForChild = (pkg) => {
    if (childAge === null) return false;
    return childAge >= pkg.minAge && childAge <= pkg.maxAge;
  };

  const formatMonthRange = (minMonth, maxMonth) => {
    if (minMonth === 0 && maxMonth === 0) return "Sơ sinh";
    return `${minMonth === 0 ? "Sơ sinh" : `${minMonth} tháng`} - ${maxMonth} tháng`;
  };

  const renderSelectedPackageDetails = () => {
    if (!selectedPackage.packageId) {
      return (
        <div className="empty-selection">
          <p>Chưa chọn gói. Vui lòng chọn một gói tiêm chủng.</p>
        </div>
      );
    }

    return (
      <div className="selected-package">
        <h3 className="package-title">{selectedPackage.packageName}</h3>
        {childName && <div className="child-info">Trẻ: {childName}</div>}
        {childAge !== null && (
          <div className="child-info">
            Tuổi: {childAge} tháng ({(childAge / 12).toFixed(1)} năm)
          </div>
        )}

        <h4 className="vaccines-title">Vắc-xin đã chọn:</h4>
        <div className="selected-vaccines-list">
          {selectedPackage.selectedVaccines.map((vaccine) => (
            <div key={vaccine.vaccineId} className="vaccine-item">
              <Image src={vaccine.image} alt={vaccine.vaccineName} className="vaccine-image" />
              <div className="vaccine-details">
                <div className="vaccine-name">{vaccine.vaccineName}</div>
                <div className="vaccine-origin">
                  {vaccine.manufacturers[0]?.name} ({vaccine.manufacturers[0]?.countryCode})
                </div>
                <div className="vaccine-price">{formatPrice(vaccine.price)}</div>
              </div>
              <Button type="primary" size="small" onClick={() => openVaccineAlternatives(vaccine)}>
                Đổi phiên bản
              </Button>
            </div>
          ))}
        </div>

        <div className="date-selection">
          <label>Ngày tiêm chủng:</label>
          <DatePicker
            className="date-picker"
            onChange={handleDateChange}
            value={selectedPackage.vaccinationDate ? dayjs(selectedPackage.vaccinationDate) : null}
            placeholder="Chọn ngày tiêm chủng"
            disabled={scheduleLoading}
          />
          {scheduleLoading && <div className="loading-text">Đang tải xem trước lịch...</div>}
        </div>

        <div className="payment-selection">
          <label>Phương thức thanh toán:</label>
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

        {/* Removed the total-price div */}
        <div className="total-price">
          <span>Tổng cộng:</span>
          <span className="price-value">{formatPrice(calculateTotalPrice())}</span>
        </div>

        <Button
          type="primary"
          className="submit-btn"
          onClick={handleSubmitVaccination}
          disabled={!selectedPackage.vaccinationDate || !paymentMethod || loading}
        >
          {loading ? "Đang xử lý..." : "Đăng ký tiêm chủng"}
        </Button>
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
        <h3 className="schedule-title">Lịch tiêm chủng dự kiến</h3>
        <p className="schedule-note">Đây là xem trước lịch tiêm chủng của bạn. Nhấp Đăng ký tiêm chủng để xác nhận.</p>
        {Object.entries(groupedByType).map(([vaccineType, schedules]) => (
          <div key={vaccineType} className="vaccine-type-group">
            <h4>{vaccineType}</h4>
            <List
              bordered
              dataSource={schedules}
              renderItem={(item) => (
                <List.Item className="schedule-item">
                  <div>{dayjs(item.scheduleDate).format("DD/MM/YYYY")}</div>
                  <Tag color="blue">Xem trước</Tag>
                </List.Item>
              )}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="vaccination-package-section">
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Form.Item label="Gói tiêm chủng" className="package-label">
            {loading ? (
              <div className="loading-state">
                <Spin /> Đang tải gói tiêm chủng...
              </div>
            ) : (
              <Collapse>
                {sortedPackageGroups().map(([ageRange, packagesInGroup]) => {
                  const [minMonth, maxMonth] = ageRange.split(" - ").map((v) => parseInt(v.trim(), 10));
                  return (
                    <Panel
                      header={
                        <div className="panel-header">
                          <span>Gói cho {formatMonthRange(minMonth, maxMonth)}</span>
                          {childAge !== null && childAge >= minMonth && childAge <= maxMonth && (
                            <Tag color="green">Khuyến nghị cho con bạn</Tag>
                          )}
                        </div>
                      }
                      key={ageRange}
                    >
                      {packagesInGroup.map((pkg) => (
                        <Card
                          key={pkg.packageId}
                          className={`package-card ${selectedPackage.packageId === pkg.packageId ? "selected" : ""} ${
                            isPackageAppropriateForChild(pkg) ? "recommended" : ""
                          }`}
                          title={
                            <div className="card-title">
                              <span>{pkg.packageName}</span>
                              <Checkbox
                                checked={selectedPackage.packageId === pkg.packageId}
                                onChange={() => handlePackageSelect(pkg)}
                              />
                            </div>
                          }
                        >
                          <p>{pkg.description}</p>
                          {pkg.vaccines && pkg.vaccines.length > 0 ? (
                            <Row gutter={[16, 16]}>
                              {pkg.vaccines.map((vaccine) => (
                                <Col xs={24} sm={12} md={8} key={vaccine.vaccineId}>
                                  <Card className="vaccine-card">
                                    <Image src={vaccine.image} alt={vaccine.vaccineName} className="vaccine-image" />
                                    <div className="vaccine-name">{vaccine.vaccineName}</div>
                                    <div className="vaccine-info">{vaccine.description?.info}</div>
                                    <div className="vaccine-price">{formatPrice(vaccine.price)}</div>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          ) : (
                            <p>Không có vắc-xin</p>
                          )}
                        </Card>
                      ))}
                    </Panel>
                  );
                })}
              </Collapse>
            )}
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          {renderSelectedPackageDetails()}
          {renderTemporarySchedules()}
        </Col>
      </Row>

      <Modal
        title="Chọn vắc-xin thay thế"
        open={vaccineModalVisible}
        onCancel={() => setVaccineModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentVaccine && (
          <>
            <h4>Vắc-xin hiện tại:</h4>
            <Table
              dataSource={[currentVaccine]} // Wrap currentVaccine in an array to use as table data
              rowKey="vaccineId"
              pagination={false}
              columns={[
                {
                  title: "Hình ảnh",
                  dataIndex: "image",
                  key: "image",
                  render: (image) => <Image src={image} alt="Vaccine" className="vaccine-image-table" />,
                },
                { title: "Vắc-xin", dataIndex: "vaccineName", key: "vaccineName" },
                {
                  title: "Nhà sản xuất",
                  dataIndex: ["manufacturers", 0, "name"],
                  key: "manufacturer",
                  render: (text, record) => (
                    <span>
                      {record.manufacturers[0]?.name} ({record.manufacturers[0]?.countryCode})
                    </span>
                  ),
                },
                { title: "Giá", dataIndex: "price", key: "price", render: formatPrice },
              ]}
            />
          </>
        )}

        {alternativeVaccines.length === 0 ? (
          <div className="no-alternatives">Không tìm thấy vắc-xin thay thế có cùng tên.</div>
        ) : (
          <Table
            dataSource={alternativeVaccines}
            rowKey="vaccineId"
            pagination={false}
            columns={[
              {
                title: "Hình ảnh",
                dataIndex: "image",
                key: "image",
                render: (image) => <Image src={image} alt="Vaccine" className="vaccine-image-table" />,
              },
              { title: "Vắc-xin", dataIndex: "vaccineName", key: "vaccineName" },
              {
                title: "Nhà sản xuất",
                dataIndex: ["manufacturers", 0, "name"],
                key: "manufacturer",
                render: (text, record) => (
                  <span>
                    {record.manufacturers[0]?.name} ({record.manufacturers[0]?.countryCode})
                  </span>
                ),
              },
              { title: "Giá", dataIndex: "price", key: "price", render: formatPrice },
              {
                title: "Hành động",
                key: "action",
                render: (_, record) => (
                  <Button type="primary" onClick={() => handleVaccineReplace(record)}>
                    Chọn
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Modal>

      <Modal
        title="Xác nhận tiêm chủng"
        open={confirmModalVisible}
        onOk={confirmVaccination}
        onCancel={() => setConfirmModalVisible(false)}
        confirmLoading={loading}
      >
        <p>Bạn có chắc chắn muốn đăng ký gói tiêm chủng này không?</p>
        <div className="confirm-details">
          <div>
            <strong>Gói:</strong> {selectedPackage.packageName}
          </div>
          <div>
            <strong>Trẻ:</strong> {childName}
          </div>
          <div>
            <strong>Ngày:</strong>{" "}
            {selectedPackage.vaccinationDate && dayjs(selectedPackage.vaccinationDate).format("DD/MM/YYYY")}
          </div>
          <div>
            <strong>Phương thức thanh toán:</strong> {paymentMethod === "vnpay" ? "VNPAY" : "MoMo"}
          </div>
          <div>
            <strong>Tổng số tiền:</strong> {formatPrice(calculateTotalPrice())}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VaccinationPackageSection;
