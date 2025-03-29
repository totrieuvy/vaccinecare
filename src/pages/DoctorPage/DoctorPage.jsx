/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Steps, Table, Input, Form, Button, Checkbox, message, Modal, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChildByDoctor } from "../../redux/features/doctorSlice";
import { setPreVaccineInfo, resetPreVaccineInfo } from "../../redux/features/preVaccineInfoSlice";
import {
  LogoutOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";
import "./DoctorPage.scss";
import { logout } from "../../redux/features/userSlice";

const { Step } = Steps;

const DoctorPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedChild = useSelector((state) => state.doctor.selectedChild);
  const user = useSelector((state) => state.user);
  const preVaccineInfo = useSelector((state) => state.preVaccineInfo);
  const [schedules, setSchedules] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [search, setSearch] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [postVaccineForm] = Form.useForm();
  const [medicalInfo, setMedicalInfo] = useState({
    weight: "",
    height: "",
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    heartDisease: false,
    hypertension: false,
    drugAllergy: false,
    foodAllergy: false,
    noChronic: false,
    currentMedications: "",
    previousVaccineReactions: "",
  });
  const [postVaccineInfo, setPostVaccineInfo] = useState({
    localReaction: false,
    fever: false,
    muscleAche: false,
    fatigue: false,
    headache: false,
    nausea: false,
    noReaction: false,
    otherReactions: "",
    severityLevel: "Không",
    notes: "",
    vaccineBatch: "",
  });
  const [vaccineAdministered, setVaccineAdministered] = useState(false);

  const fetchSchedules = async () => {
    try {
      const response = await api.get("schedule");
      if (response.data.statusCode === 200) {
        const filteredData = response.data.data.filter((item) =>
          ["check-in", "vaccinated", "completed"].includes(item.scheduleStatus)
        );
        setSchedules(filteredData);
      }
    } catch (error) {
      console.error("Error fetching schedules", error);
    }
  };

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const response = await api.get("v1/vaccine?pageIndex=1&pageSize=10");
        if (response.data.statusCode === 200) {
          setVaccines(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching vaccines", error);
      }
    };

    fetchSchedules();
    fetchVaccines();
    const interval = setInterval(fetchSchedules, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (medicalInfo.noChronic) {
      setMedicalInfo({
        ...medicalInfo,
        heartDisease: false,
        hypertension: false,
        drugAllergy: false,
        foodAllergy: false,
      });
    }
  }, [medicalInfo.noChronic]);

  useEffect(() => {
    if (medicalInfo.heartDisease || medicalInfo.hypertension || medicalInfo.drugAllergy || medicalInfo.foodAllergy) {
      setMedicalInfo({
        ...medicalInfo,
        noChronic: false,
      });
    }
  }, [medicalInfo.heartDisease, medicalInfo.hypertension, medicalInfo.drugAllergy, medicalInfo.foodAllergy]);

  const handleSelectChild = (record) => {
    dispatch(setSelectedChildByDoctor(record));
    setCurrentStep(1);
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "Đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất?",
      onOk: () => {
        localStorage.removeItem("token");
        dispatch(setSelectedChildByDoctor(null));
        dispatch(logout());
        navigate("/login");
      },
    });
  };

  const goBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleVaccineAdministration = async () => {
    try {
      const response = await api.post("vaccinecheckup/pre-vaccine", {
        scheduleId: selectedChild.scheduleId,
        doctorId: preVaccineInfo.doctorId,
        weight: parseFloat(preVaccineInfo.weight) || 0,
        height: parseFloat(preVaccineInfo.height) || 0,
        temperature: parseFloat(preVaccineInfo.temperature) || 0,
        bloodPressure: preVaccineInfo.bloodPressure || "",
        pulse: parseFloat(preVaccineInfo.pulse) || 0,
        chronicDiseases: preVaccineInfo.chronicDiseases || [],
        currentMedications: preVaccineInfo.currentMedications || "",
        previousVaccineReactions: preVaccineInfo.previousVaccineReactions || "",
        batchId: postVaccineInfo.vaccineBatch || "",
      });

      if (response.data.statusCode === 200) {
        setVaccineAdministered(true);
        setCurrentStep(3);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi dữ liệu tiêm chủng");
      console.error("Error submitting vaccine data", error);
    }
  };

  const submitVaccineReaction = async () => {
    try {
      const reactions = postVaccineInfo.noReaction
        ? ["noReaction"]
        : [
            postVaccineInfo.localReaction && "localReaction",
            postVaccineInfo.fever && "fever",
            postVaccineInfo.muscleAche && "muscleAche",
            postVaccineInfo.fatigue && "fatigue",
            postVaccineInfo.headache && "headache",
            postVaccineInfo.nausea && "nausea",
          ].filter(Boolean);

      const response = await api.post("vaccinereaction", {
        scheduleId: selectedChild.scheduleId,
        reactions: reactions.length > 0 ? reactions : ["noReaction"],
        otherReactions: postVaccineInfo.otherReactions,
        severity: postVaccineInfo.severityLevel,
        notes: postVaccineInfo.notes,
      });

      if (response.data.statusCode === 200) {
        setCurrentStep(4);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi dữ liệu phản ứng");
      console.error("Error submitting vaccine reaction", error);
    }
  };

  const proceedToNextStep = async () => {
    if (currentStep === 0) {
      if (!selectedChild) {
        message.error("Vui lòng chọn một bệnh nhân trước khi tiếp tục");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      try {
        await form.validateFields();
        let chronicDiseases = [];
        if (medicalInfo.noChronic) {
          chronicDiseases = ["noChronic"];
        } else {
          chronicDiseases = [
            medicalInfo.heartDisease && "heartDisease",
            medicalInfo.hypertension && "hypertension",
            medicalInfo.drugAllergy && "drugAllergy",
            medicalInfo.foodAllergy && "foodAllergy",
          ].filter(Boolean);
        }
        dispatch(
          setPreVaccineInfo({
            doctorId: user.userId,
            weight: medicalInfo.weight,
            height: medicalInfo.height,
            temperature: medicalInfo.temperature,
            bloodPressure: medicalInfo.bloodPressure,
            pulse: medicalInfo.heartRate,
            chronicDiseases: chronicDiseases,
            currentMedications: medicalInfo.currentMedications,
            previousVaccineReactions: medicalInfo.previousVaccineReactions,
          })
        );
        setCurrentStep(2);
      } catch (error) {
        message.error("Vui lòng điền đầy đủ thông tin y tế trước khi tiếp tục", error);
      }
    } else if (currentStep === 2) {
      try {
        await form.validateFields();
        await handleVaccineAdministration();
      } catch (error) {
        message.error("Vui lòng nhập mã lô vaccine", error);
      }
    } else if (currentStep === 3) {
      try {
        await postVaccineForm.validateFields();
        await submitVaccineReaction();
      } catch (error) {
        message.error("Vui lòng điền đầy đủ thông tin phản ứng sau tiêm chủng", error);
      }
    }
  };

  const finishProcess = async () => {
    message.success("Quá trình khám bệnh và tiêm chủng hoàn tất!");
    dispatch(resetPreVaccineInfo());
    setMedicalInfo({
      weight: "",
      height: "",
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      heartDisease: false,
      hypertension: false,
      drugAllergy: false,
      foodAllergy: false,
      noChronic: false,
      currentMedications: "",
      previousVaccineReactions: "",
    });
    setPostVaccineInfo({
      localReaction: false,
      fever: false,
      muscleAche: false,
      fatigue: false,
      headache: false,
      nausea: false,
      noReaction: false,
      otherReactions: "",
      severityLevel: "Không",
      notes: "",
      vaccineBatch: "",
    });
    setVaccineAdministered(false);
    dispatch(setSelectedChildByDoctor(null));
    setCurrentStep(0);
    await fetchSchedules(); // Gọi lại API schedule ngay sau khi quay về Step 1
  };

  const getVaccineInfo = (vaccineId) => {
    const vaccine = vaccines.find((v) => v.vaccineId === vaccineId);
    if (vaccine) {
      return {
        vaccineName: vaccine.vaccineName,
        manufacturerName: vaccine.manufacturers[0]?.name || "Không có",
        countryName: vaccine.manufacturers[0]?.countryName || "Không có",
      };
    }
    return { vaccineName: "Không xác định", manufacturerName: "Không có", countryName: "Không có" };
  };

  const columns = [
    { title: "Tên trẻ", dataIndex: "childrenName", key: "childrenName" },
    {
      title: "Tên vaccine",
      key: "vaccineName",
      render: (_, record) => getVaccineInfo(record.vaccineId).vaccineName,
    },
    { title: "Ngày hẹn", dataIndex: "scheduleDate", key: "scheduleDate" },
    { title: "Trạng thái", dataIndex: "scheduleStatus", key: "scheduleStatus" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.scheduleStatus !== "completed" ? (
          <Button type="primary" onClick={() => handleSelectChild(record)}>
            Chọn
          </Button>
        ) : null,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-container">
            <div className="search-container">
              <Input
                placeholder="Tìm kiếm theo tên trẻ"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
                prefix={<span className="search-icon">🔍</span>}
              />
            </div>
            <Table
              dataSource={schedules.filter((item) => item.childrenName.toLowerCase().includes(search.toLowerCase()))}
              columns={columns}
              rowKey="scheduleId"
              className="patient-table"
              pagination={{ pageSize: 8 }}
            />
            <div className="navigation-buttons">
              <Button type="primary" onClick={proceedToNextStep} disabled={!selectedChild} className="next-button">
                Tiếp tục <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="step-container">
            <div className="patient-header">
              <h2>Thông tin bệnh nhân: {selectedChild?.childrenName}</h2>
              <p>Vaccine: {getVaccineInfo(selectedChild?.vaccineId).vaccineName}</p>
            </div>
            <Form form={form} layout="vertical" className="medical-form">
              <div className="form-row">
                <Form.Item
                  name="weight"
                  label="Cân nặng (kg)"
                  rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
                >
                  <Input
                    value={medicalInfo.weight}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, weight: e.target.value })}
                    suffix="kg"
                  />
                </Form.Item>
                <Form.Item
                  name="height"
                  label="Chiều cao (cm)"
                  rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
                >
                  <Input
                    value={medicalInfo.height}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, height: e.target.value })}
                    suffix="cm"
                  />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="temperature"
                  label="Nhiệt độ (°C)"
                  rules={[{ required: true, message: "Vui lòng nhập nhiệt độ" }]}
                >
                  <Input
                    value={medicalInfo.temperature}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, temperature: e.target.value })}
                    suffix="°C"
                  />
                </Form.Item>
                <Form.Item
                  name="bloodPressure"
                  label="Huyết áp (mmHg)"
                  rules={[{ required: true, message: "Vui lòng nhập huyết áp" }]}
                >
                  <Input
                    value={medicalInfo.bloodPressure}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, bloodPressure: e.target.value })}
                    suffix="mmHg"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="heartRate"
                label="Nhịp tim (BPM)"
                rules={[{ required: true, message: "Vui lòng nhập nhịp tim" }]}
              >
                <Input
                  value={medicalInfo.heartRate}
                  onChange={(e) => setMedicalInfo({ ...medicalInfo, heartRate: e.target.value })}
                  suffix="BPM"
                />
              </Form.Item>

              <div className="diseases-section">
                <h3>Bệnh mãn tính:</h3>
                <Form.Item name="heartDisease">
                  <Checkbox
                    checked={medicalInfo.heartDisease}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, heartDisease: e.target.checked })}
                  >
                    Bệnh tim mạch
                  </Checkbox>
                </Form.Item>
                <Form.Item name="hypertension">
                  <Checkbox
                    checked={medicalInfo.hypertension}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, hypertension: e.target.checked })}
                  >
                    Tăng huyết áp
                  </Checkbox>
                </Form.Item>
                <Form.Item name="drugAllergy">
                  <Checkbox
                    checked={medicalInfo.drugAllergy}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, drugAllergy: e.target.checked })}
                  >
                    Dị ứng các thành phần cơ bản của thuốc
                  </Checkbox>
                </Form.Item>
                <Form.Item name="foodAllergy">
                  <Checkbox
                    checked={medicalInfo.foodAllergy}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, foodAllergy: e.target.checked })}
                  >
                    Dị ứng thức ăn
                  </Checkbox>
                </Form.Item>
                <Form.Item name="noChronic">
                  <Checkbox
                    checked={medicalInfo.noChronic}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, noChronic: e.target.checked })}
                  >
                    Không có bệnh mãn tính
                  </Checkbox>
                </Form.Item>
              </div>

              <Form.Item
                name="currentMedications"
                label="Thuốc đang sử dụng"
                rules={[{ required: true, message: "Vui lòng nhập thuốc đang sử dụng hoặc 'Không có'" }]}
              >
                <Input.TextArea
                  value={medicalInfo.currentMedications}
                  onChange={(e) => setMedicalInfo({ ...medicalInfo, currentMedications: e.target.value })}
                  rows={2}
                />
              </Form.Item>

              <Form.Item
                name="previousVaccineReactions"
                label="Phản ứng sau tiêm chủng trước đây"
                rules={[{ required: true, message: "Vui lòng nhập thông tin hoặc 'Không có'" }]}
              >
                <Input.TextArea
                  value={medicalInfo.previousVaccineReactions}
                  onChange={(e) => setMedicalInfo({ ...medicalInfo, previousVaccineReactions: e.target.value })}
                  rows={2}
                />
              </Form.Item>

              <div className="navigation-buttons">
                <Button type="default" onClick={goBack} className="back-button">
                  <ArrowLeftOutlined /> Quay lại
                </Button>
                <Button type="primary" onClick={proceedToNextStep} className="next-button">
                  Tiếp tục <ArrowRightOutlined />
                </Button>
              </div>
            </Form>
          </div>
        );
      case 2:
        return (
          <div className="step-container">
            <div className="confirmation-container">
              <h2>Xác nhận thông tin y tế</h2>
              <div className="confirmation-header">
                <h3>Bệnh nhân: {selectedChild?.childrenName}</h3>
                <p>Vaccine: {getVaccineInfo(selectedChild?.vaccineId).vaccineName}</p>
                <p>Nhà sản xuất: {getVaccineInfo(selectedChild?.vaccineId).manufacturerName}</p>
                <p>Quốc gia: {getVaccineInfo(selectedChild?.vaccineId).countryName}</p>
                <p>Ngày hẹn: {selectedChild?.scheduleDate}</p>
              </div>

              <div className="confirmation-section">
                <h3>Thông tin cơ bản</h3>
                <div className="confirmation-grid">
                  <div className="info-item">
                    <span className="label">Cân nặng:</span>
                    <span className="value">{medicalInfo.weight} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Chiều cao:</span>
                    <span className="value">{medicalInfo.height} cm</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Nhiệt độ:</span>
                    <span className="value">{medicalInfo.temperature} °C</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Huyết áp:</span>
                    <span className="value">{medicalInfo.bloodPressure} mmHg</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Nhịp tim:</span>
                    <span className="value">{medicalInfo.heartRate} BPM</span>
                  </div>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>Bệnh mãn tính</h3>
                <ul>
                  {medicalInfo.heartDisease && <li>Bệnh tim mạch</li>}
                  {medicalInfo.hypertension && <li>Tăng huyết áp</li>}
                  {medicalInfo.drugAllergy && <li>Dị ứng các thành phần cơ bản của thuốc</li>}
                  {medicalInfo.foodAllergy && <li>Dị ứng thức ăn</li>}
                  {medicalInfo.noChronic && <li>Không có bệnh mãn tính</li>}
                </ul>
                {!medicalInfo.heartDisease &&
                  !medicalInfo.hypertension &&
                  !medicalInfo.drugAllergy &&
                  !medicalInfo.foodAllergy &&
                  !medicalInfo.noChronic && <p>Không có bệnh mãn tính</p>}
              </div>

              <div className="confirmation-section">
                <h3>Thuốc đang sử dụng</h3>
                <p>{medicalInfo.currentMedications || "Không có"}</p>
              </div>

              <div className="confirmation-section">
                <h3>Phản ứng sau tiêm chủng trước đây</h3>
                <p>{medicalInfo.previousVaccineReactions || "Không có"}</p>
              </div>

              <div className="vaccine-batch-section">
                <h3>Thông tin lô vaccine</h3>
                <Form.Item
                  name="vaccineBatch"
                  label="Mã lô vaccine"
                  rules={[{ required: true, message: "Vui lòng nhập mã lô vaccine" }]}
                >
                  <Input
                    value={postVaccineInfo.vaccineBatch}
                    onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, vaccineBatch: e.target.value })}
                    placeholder="Ví dụ: VX-2025-0348"
                  />
                </Form.Item>
              </div>

              <div className="navigation-buttons">
                <Button type="default" onClick={goBack} className="back-button">
                  <ArrowLeftOutlined /> Quay lại
                </Button>
                <Button type="primary" onClick={proceedToNextStep} className="next-button">
                  Tiến hành tiêm chủng <MedicineBoxOutlined />
                </Button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-container">
            <div className="vaccination-container">
              <h2>Tiến hành tiêm chủng</h2>
              <div className="vaccination-details">
                <h3>Thông tin tiêm chủng</h3>
                <p>Bệnh nhân: {selectedChild?.childrenName}</p>
                <p>Vaccine: {getVaccineInfo(selectedChild?.vaccineId).vaccineName}</p>
                <p>Trạng thái: {vaccineAdministered ? "Đã tiêm" : "Chưa tiêm"}</p>
              </div>

              <div className="observation-section">
                <h3>Ghi nhận phản ứng sau tiêm</h3>
                <Form form={postVaccineForm} layout="vertical" className="post-vaccine-form">
                  <div className="reactions-section">
                    <Form.Item name="noReaction">
                      <Checkbox
                        checked={postVaccineInfo.noReaction}
                        onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, noReaction: e.target.checked })}
                      >
                        Không có phản ứng
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="localReaction">
                      <Checkbox
                        checked={postVaccineInfo.localReaction}
                        onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, localReaction: e.target.checked })}
                      >
                        Phản ứng tại chỗ (đau, sưng, đỏ)
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="fever">
                      <Checkbox
                        checked={postVaccineInfo.fever}
                        onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, fever: e.target.checked })}
                      >
                        Sốt
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="muscleAche">
                      <Checkbox
                        checked={postVaccineInfo.muscleAche}
                        onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, muscleAche: e.target.checked })}
                      >
                        Đau cơ
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="fatigue">
                      <Checkbox
                        checked={postVaccineInfo.fatigue}
                        onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, fatigue: e.target.checked })}
                      >
                        Mệt mỏi
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="headache">
                      <Checkbox
                        checked={postVaccineInfo.headache}
                        onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, headache: e.target.checked })}
                      >
                        Đau đầu
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="nausea">
                      <Checkbox
                        checked={postVaccineInfo.nausea}
                        onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, nausea: e.target.checked })}
                      >
                        Buồn nôn
                      </Checkbox>
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="otherReactions"
                    label="Phản ứng khác"
                    rules={[{ required: true, message: "Vui lòng nhập phản ứng khác hoặc 'Không'" }]}
                  >
                    <Input.TextArea
                      value={postVaccineInfo.otherReactions}
                      onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, otherReactions: e.target.value })}
                      rows={2}
                      placeholder="Nhập phản ứng khác hoặc 'Không'"
                    />
                  </Form.Item>

                  <Form.Item
                    name="severityLevel"
                    label="Mức độ nghiêm trọng"
                    rules={[{ required: true, message: "Vui lòng chọn mức độ nghiêm trọng" }]}
                    initialValue="Không"
                  >
                    <Radio.Group
                      value={postVaccineInfo.severityLevel}
                      onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, severityLevel: e.target.value })}
                    >
                      <Radio value="Không">Không</Radio>
                      <Radio value="nhẹ">Nhẹ</Radio>
                      <Radio value="trung bình">Trung bình</Radio>
                      <Radio value="nặng">Nặng</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="notes"
                    label="Ghi chú thêm"
                    rules={[{ required: true, message: "Vui lòng nhập ghi chú hoặc 'Không có'" }]}
                  >
                    <Input.TextArea
                      value={postVaccineInfo.notes}
                      onChange={(e) => setPostVaccineInfo({ ...postVaccineInfo, notes: e.target.value })}
                      rows={3}
                    />
                  </Form.Item>
                </Form>
              </div>

              <div className="navigation-buttons">
                <Button type="default" onClick={goBack} className="back-button">
                  <ArrowLeftOutlined /> Quay lại
                </Button>
                <Button type="primary" onClick={proceedToNextStep} className="next-button">
                  Tiếp tục <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-container">
            <div className="completion-container">
              <h2>Hoàn tất tiêm chủng</h2>
              <div className="completion-header">
                <div className="completion-icon">✓</div>
                <h3>Tiêm chủng thành công</h3>
              </div>

              <div className="navigation-buttons">
                <Button type="primary" onClick={finishProcess} className="finish-button">
                  <CheckOutlined /> Quay về bước 1
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="doctor-page">
      <div className="header">
        <h1>Quản lý tiêm chủng</h1>
        <Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} className="logout-button">
          Đăng xuất
        </Button>
      </div>

      <div className="steps-container">
        <Steps current={currentStep}>
          <Step title="Chọn bệnh nhân" />
          <Step title="Nhập thông tin y tế" />
          <Step title="Xác nhận" />
          <Step title="Tiến hành tiêm chủng" />
          <Step title="Hoàn tất tiêm chủng" />
        </Steps>
      </div>

      <div className="content">{renderStepContent()}</div>
    </div>
  );
};

export default DoctorPage;
