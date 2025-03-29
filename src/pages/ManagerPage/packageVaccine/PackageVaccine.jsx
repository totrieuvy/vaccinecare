import { useEffect, useState } from "react";
import api from "../../../config/axios";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Table, Tag } from "antd";
import { formatVND } from "../../../utils/currencyFormat";
import { SearchOutlined } from "@ant-design/icons";
import "./PackageVaccine.scss";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";

function PackageVaccine() {
  const [form] = useForm();
  const [packageVaccine, setPackageVaccine] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [vaccineList, setVaccineList] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const columns = [
    {
      title: "Tên gói",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => formatVND(price),
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "discount",
      key: "discount",
      render: (discount) => `${discount}%`,
    },
    {
      title: "Tháng Tối Thiểu",
      dataIndex: "minAge",
      key: "minAge",
      render: (minAge) => (minAge !== null ? minAge : "N/A"),
    },
    {
      title: "Tháng Tối Đa",
      dataIndex: "maxAge",
      key: "maxAge",
      render: (maxAge) => (maxAge !== null ? maxAge : "N/A"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Hành động",
      dataIndex: "packageId",
      key: "packageId",
      render: (packageId, record) => (
        <div style={{ display: "flex", gap: "5px" }}>
          <Button type="default" onClick={() => showDetail(record)}>
            Chi tiết
          </Button>
          <Button
            type="primary"
            onClick={() => {
              const vaccineIds = record.vaccines ? record.vaccines.map((vaccine) => vaccine.vaccineId) : [];
              form.setFieldsValue({ ...record, vaccineIds });
              setIsUpdate(true);
              setOpen(true);
            }}
          >
            Chỉnh sửa
          </Button>
          <Popconfirm
            title="Delete package vaccine"
            description="Are you sure to delete this package vaccine?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(packageId)}
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDelete = async (packageId) => {
    try {
      const response = await api.delete(`/v1/package/${packageId}`);
      fetchData();
      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await api.get("/v1/package");
      const responseVaccine = await api.get("/v1/vaccine?pageIndex=1&pageSize=1000");
      setVaccineList(responseVaccine.data.data.filter((vaccine) => vaccine.isActive));
      const sortedData = response.data.data.sort((a, b) => Number(b.isActive) - Number(a.isActive));
      setPackageVaccine(sortedData);
      setFilteredPackages(sortedData);
    } catch (error) {
      console.log(error);
    }
  };

  const showDetail = (packageData) => {
    setSelectedPackage(packageData);
    setIsModalOpen(true);
  };

  const handleSearch = () => {
    const filtered = packageVaccine.filter((pkg) => pkg.packageName.toLowerCase().includes(searchText.toLowerCase()));
    setFilteredPackages(filtered);
  };

  useEffect(() => {
    fetchData();
    document.title = "Package Vaccine";
  }, []);

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOpenModal = () => {
    form.resetFields();
    setOpen(true);
  };

  const handleSubmitForm = async (values) => {
    setLoading(true);

    try {
      if (isUpdate && values.packageId) {
        console.log("Updating package with data:", {
          packageName: values.packageName,
          description: values.description,
          vaccineIds: values.vaccineIds,
          discount: values.discount,
          minAge: values.minAge,
          maxAge: values.maxAge,
          unit: values.unit,
          isActive: true,
        });
        const response = await api.put(`/v1/package/${values.packageId}`, {
          packageName: values.packageName,
          description: values.description,
          vaccineIds: values.vaccineIds,
          discount: values.discount,
          minAge: values.minAge,
          maxAge: values.maxAge,
          unit: values.unit,
          isActive: true,
        });
        fetchData();
        toast.success(response.data.message);
      } else {
        const response = await api.post("/v1/package", {
          packageName: values.packageName,
          description: values.description,
          vaccineIds: values.vaccineIds,
          discount: values.discount,
          minAge: values.minAge,
          maxAge: values.maxAge,
          unit: values.unit,
          isActive: true,
        });
        fetchData();
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(false);
      form.resetFields();
    }
  };

  return (
    <div className="PackageVaccine">
      <h1>Quản lí package</h1>
      <div className="Vaccine__above">
        <div style={{ marginBottom: 16, display: "flex", gap: "10px" }}>
          <Input
            placeholder="Nhập tên gói"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>

        <div>
          <Button type="primary" onClick={handleOpenModal}>
            Thêm mới combo
          </Button>
        </div>
      </div>

      <Table dataSource={filteredPackages} columns={columns} rowKey="packageId" />

      <Modal open={open} title="Combo" onCancel={handleCancel} onOk={() => form.submit()} confirmLoading={loading}>
        <Form form={form} layout="vertical" initialValues={{ isActive: true }} onFinish={handleSubmitForm}>
          <Form.Item name="packageId" label="packageId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="packageName"
            label="Package Name"
            rules={[{ required: true, message: "Please enter the package name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter the description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="vaccineIds"
            label="Select Vaccines"
            rules={[{ required: true, message: "Please select at least one vaccine" }]}
          >
            <Select mode="multiple">
              {vaccineList.map((vaccine) => (
                <Select.Option key={vaccine.vaccineId} value={vaccine.vaccineId}>
                  {vaccine.vaccineName} - {vaccine.price.toLocaleString()} VND
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="discount"
            label="Discount"
            rules={[{ required: true, message: "Please enter the discount" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="minAge"
            label="Minimum Age"
            rules={[
              { required: true, message: "Please enter the minimum age" },
              { type: "number", min: 0, message: "Minimum age must be greater or equal 0" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="maxAge"
            label="Maximum Age"
            rules={[
              { required: true, message: "Please enter the maximum age" },
              { type: "number", min: 0, message: "Minimum age must be greater or equal 0" },
              { type: "number", max: 96, message: "Maximum age must be less than 96" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: "Please enter unit" }]}
            initialValue="year"
          >
            <Input placeholder="Enter unit" disabled />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết gói vaccine"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedPackage ? (
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1, lineHeight: "2.5", paddingRight: "20px" }}>
              <p>
                <strong>Tên gói:</strong> {selectedPackage.packageName}
              </p>
              <p>
                <strong>Mô tả:</strong> {selectedPackage.description}
              </p>
              <p>
                <strong>Giá:</strong> {formatVND(selectedPackage.price)}
              </p>
              <p>
                <strong>Giảm giá:</strong> {selectedPackage.discount}%
              </p>
              <p>
                <strong>Tháng tối thiểu:</strong> {selectedPackage.minAge ?? "N/A"}
              </p>
              <p>
                <strong>Tháng tối đa:</strong> {selectedPackage.maxAge ?? "N/A"}
              </p>
              <p>
                <strong>Trạng thái:</strong>
                <Tag color={selectedPackage.isActive ? "green" : "red"}>
                  {selectedPackage.isActive ? "Active" : "Inactive"}
                </Tag>
              </p>
            </div>
            <div style={{ flex: 1, maxHeight: "400px", overflowY: "auto" }}>
              <h3>Danh sách Vaccine:</h3>
              {selectedPackage.vaccines && selectedPackage.vaccines.length > 0 ? (
                <ul style={{ padding: 0 }}>
                  {selectedPackage.vaccines.map((vaccine) => (
                    <li
                      key={vaccine.vaccineId}
                      style={{
                        border: "1px solid #d9d9d9", // Thêm viền
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "4px", // Bo góc cho đẹp
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Thêm bóng nhẹ cho phần tử
                      }}
                    >
                      <p>
                        <strong>Tên Vaccine:</strong> {vaccine.vaccineName}
                      </p>
                      <p>
                        <strong>Nhà sản xuất:</strong> {vaccine.manufacturers[0].name} (
                        {vaccine.manufacturers[0].countryName})
                      </p>
                      <p>
                        <strong>Lịch tiêm:</strong> {vaccine.description.injectionSchedule}
                      </p>
                      <p>
                        <strong>Phản ứng:</strong> {vaccine.description.vaccineReaction}
                      </p>
                      <img src={vaccine.image} alt={vaccine.vaccineName} style={{ width: "100px" }} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Không có vaccine nào trong gói này.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Modal>
    </div>
  );
}

export default PackageVaccine;
