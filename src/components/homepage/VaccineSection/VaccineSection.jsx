import { useEffect, useState } from "react";
import { Typography, Row, Col, Card, Select, Pagination } from "antd";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../../config/axios";
import "./VaccineSection.scss";

const { Title } = Typography;
const { Option } = Select;

const VaccineSection = () => {
  const [vaccines, setVaccines] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [priceSortOrder, setPriceSortOrder] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10); // Cố định pageSize là 10
  const [totalItems, setTotalItems] = useState(0);

  const fetchVaccines = async () => {
    try {
      const response = await api.get(`v1/vaccine`, {
        params: {
          pageIndex: pageIndex,
          pageSize: pageSize,
        },
      });
      if (response.data && response.data.statusCode === 200) {
        setVaccines(response.data.data || []);
        // Sử dụng totalCount từ API thay vì totalItems
        setTotalItems(response.data.totalCount || response.data.data.length);
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error);
    }
  };

  useEffect(() => {
    fetchVaccines();
    document.title = "Home";
  }, [pageIndex]); // Gọi lại API khi pageIndex thay đổi

  const getManufacturer = (vaccine) => {
    return vaccine.manufacturers && vaccine.manufacturers.length > 0 ? vaccine.manufacturers[0] : null;
  };

  const manufacturerOptions = Array.from(
    new Set(vaccines.map((vaccine) => getManufacturer(vaccine)?.name).filter(Boolean))
  );
  const ageOptions = Array.from(new Set(vaccines.map((vaccine) => `${vaccine.minAge} - ${vaccine.maxAge}`))).sort(
    (a, b) => parseInt(a.split(" - ")[0], 10) - parseInt(b.split(" - ")[0], 10)
  );
  const countryOptions = Array.from(
    new Set(vaccines.map((vaccine) => getManufacturer(vaccine)?.countryName).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const applyFilters = () => {
    setPageIndex(1); // Reset về trang 1 khi áp dụng bộ lọc
    fetchVaccines();
  };

  const filteredVaccines = vaccines.filter((vaccine) => {
    const manufacturer = getManufacturer(vaccine);
    return (
      (!selectedManufacturer || (manufacturer && manufacturer.name === selectedManufacturer)) &&
      (!selectedAge || `${vaccine.minAge} - ${vaccine.maxAge}` === selectedAge) &&
      (selectedCountry.length === 0 || (manufacturer && selectedCountry.includes(manufacturer.countryName)))
    );
  });

  let sortedVaccines = [...filteredVaccines];
  if (priceSortOrder) {
    sortedVaccines.sort((a, b) => (priceSortOrder === "asc" ? a.price - b.price : b.price - a.price));
  } else {
    sortedVaccines.sort((a, b) =>
      a.minAge !== b.minAge ? a.minAge - b.minAge : a.vaccineName.localeCompare(b.vaccineName)
    );
  }

  const handlePaginationChange = (page) => {
    setPageIndex(page);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1 },
    }),
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <Title level={2} className="text-center mb-12" style={{ display: "flex", justifyContent: "center" }}>
            Danh sách vaccine
          </Title>
        </motion.div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={6}>
            <div className="vaccine-filter-sidebar">
              <div className="filter-item">
                <label>Nhà sản xuất:</label>
                <Select
                  placeholder="Chọn nhà sản xuất"
                  value={selectedManufacturer || undefined}
                  onChange={(value) => {
                    setSelectedManufacturer(value);
                    applyFilters();
                  }}
                  allowClear
                  style={{ width: "100%" }}
                >
                  {manufacturerOptions.map((manufacturer, index) => (
                    <Option key={index} value={manufacturer}>
                      {manufacturer}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="filter-item">
                <label>Độ tuổi:</label>
                <Select
                  placeholder="Chọn độ tuổi"
                  value={selectedAge || undefined}
                  onChange={(value) => {
                    setSelectedAge(value);
                    applyFilters();
                  }}
                  allowClear
                  style={{ width: "100%" }}
                >
                  {ageOptions.map((age, index) => (
                    <Option key={index} value={age}>
                      {age} tháng
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="filter-item">
                <label>Quốc gia:</label>
                <Select
                  mode="multiple"
                  placeholder="Chọn quốc gia"
                  value={selectedCountry}
                  onChange={(value) => {
                    setSelectedCountry(value);
                    applyFilters();
                  }}
                  allowClear
                  style={{ width: "100%" }}
                >
                  {countryOptions.map((country, index) => (
                    <Option key={index} value={country}>
                      {country}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="filter-item">
                <label>Sắp xếp theo giá:</label>
                <Select
                  placeholder="Chọn sắp xếp"
                  value={priceSortOrder || undefined}
                  onChange={(value) => {
                    setPriceSortOrder(value);
                    applyFilters();
                  }}
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="asc">Tăng dần</Option>
                  <Option value="desc">Giảm dần</Option>
                </Select>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={24} md={18}>
            <Row gutter={[16, 16]} justify="start">
              {sortedVaccines.map((vaccine, index) => {
                const manufacturer = getManufacturer(vaccine);
                return (
                  <Col key={index}>
                    <Link to={`/detail/${vaccine.vaccineId}`}>
                      <motion.div custom={index} initial="hidden" animate="visible" variants={cardVariants}>
                        <Card
                          hoverable
                          cover={<img alt={vaccine.vaccineName} src={vaccine.image} className="vaccine-image" />}
                          className="vaccine-card"
                        >
                          <div className="vaccine-info">
                            <h3 className="vaccine-name">{vaccine.vaccineName}</h3>
                            <p className="vaccine-age">
                              Độ tuổi: {vaccine.minAge} - {vaccine.maxAge} tháng
                            </p>
                            <p className="vaccine-price">Giá: {vaccine.price.toLocaleString("vi-VN")} VND</p>
                            {manufacturer && (
                              <>
                                <p className="vaccine-manufacturer">Nhà sản xuất: {manufacturer.name}</p>
                                <p className="vaccine-country">Quốc gia: {manufacturer.countryName}</p>
                              </>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    </Link>
                  </Col>
                );
              })}
            </Row>
            <Row className="mt-6" justify="center">
              <Pagination
                current={pageIndex}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePaginationChange}
                showQuickJumper
                showTotal={(total) => `Tổng cộng ${total} vaccine`}
              />
            </Row>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default VaccineSection;
