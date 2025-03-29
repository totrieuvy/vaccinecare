import { Table, Image, Input, Space } from "antd";
import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import "./VaccineDisplay.scss";

function VaccineDisplay() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    document.title = "Danh sách Vaccine";
  }, []);

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const response = await api.get("v1/vaccine?pageIndex=1&pageSize=1000");

      if (response.data && response.data.statusCode === 200) {
        // Process data to ensure manufacturers is handled correctly
        const processedData = response.data.data
          .filter((item) => item.isActive)
          .map((item) => {
            // Set manufacturer from manufacturers array for consistent access
            if (item.manufacturers && item.manufacturers.length > 0) {
              item.manufacturer = item.manufacturers[0];
            }
            return item;
          })
          .sort((a, b) => a.price - b.price);

        setVaccines(processedData);
      }
    } catch (error) {
      console.error("Error fetching vaccines: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  // Filter function for search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Filter data based on search text and age filter
  const getFilteredData = () => {
    let filteredData = [...vaccines];

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.vaccineName.toLowerCase().includes(searchLower) ||
          item.description?.info?.toLowerCase().includes(searchLower) ||
          item.manufacturer?.name?.toLowerCase().includes(searchLower)
      );
    }

    return filteredData;
  };

  const columns = [
    {
      title: "Tên Vaccine",
      dataIndex: "vaccineName",
      key: "vaccineName",
      sorter: (a, b) => a.vaccineName.localeCompare(b.vaccineName),
    },
    {
      title: "Đối tượng tiêm",
      dataIndex: ["description", "targetedPatient"],
      key: "targetedPatient",
      ellipsis: true,
    },
    {
      title: "Độ tuổi",
      key: "ageRange",
      render: (_, record) => <span>{`${record.minAge} - ${record.maxAge} tháng tuổi`}</span>,
      sorter: (a, b) => a.minAge - b.minAge,
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Số mũi",
      dataIndex: "numberDose",
      key: "numberDose",
      sorter: (a, b) => a.numberDose - b.numberDose,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => <Image width={80} src={text} alt="Vaccine" fallback="/placeholder-vaccine.jpg" />,
    },
    {
      title: "Nhà sản xuất",
      key: "manufacturer",
      render: (_, record) => (
        <span>
          {record.manufacturer?.name || "N/A"}
          <br />
          <small>({record.manufacturer?.countryName || "N/A"})</small>
        </span>
      ),
    },
  ];

  return (
    <div className="vaccine-display">
      <div className="vaccine-display__filters">
        <Space size="large">
          <Input
            placeholder="Tìm kiếm vaccine..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
      </div>

      <Table
        className="vaccine-table"
        columns={columns}
        dataSource={getFilteredData()}
        rowKey="vaccineId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `Tổng số ${total} vaccine`,
        }}
      />
    </div>
  );
}

export default VaccineDisplay;
