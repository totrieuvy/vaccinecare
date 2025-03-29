import { Button, DatePicker, Form, Input, Modal, Popconfirm, Radio, Select, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../../config/axios";
import "./Staff.scss";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";

function Staff() {
  const [dataSource, setDataSource] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalConfig, setModalConfig] = useState({
    open: false,
    type: null, // 'add', 'edit', or 'detail'
    loading: false,
    title: "",
  });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form] = useForm();

  useEffect(() => {
    document.title = "Staff";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("v1/staff");
      const sortedData = response.data.data.sort((a, b) => b.status - a.status);
      setDataSource(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
      toast.error("Failed to fetch staff data");
      console.error(error);
    }
  };

  const handleSearch = () => {
    const filtered = dataSource.filter((item) => item.fullName.toLowerCase().includes(searchText.toLowerCase()));
    setFilteredData(filtered);
  };

  // Modal handlers
  const handleOpenModal = (type, staff = null) => {
    setModalConfig({
      open: true,
      type,
      loading: false,
      title: type === "add" ? "Add Staff" : type === "edit" ? "Edit Staff" : "Staff Details",
    });

    if (staff) {
      setSelectedStaff(staff);
      if (type === "edit") {
        form.setFieldsValue({
          ...staff,
          // Convert userName to username for consistency
          username: staff.userName,
          dob: staff.dob ? dayjs(staff.dob, "DD-MM-YYYY") : null,
        });
      }
    } else {
      form.resetFields();
      setSelectedStaff(null);
    }
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, open: false }));
    form.resetFields();
    setSelectedStaff(null);
  };

  // CRUD operations
  const handleSubmit = async (values) => {
    setModalConfig((prev) => ({ ...prev, loading: true }));
    try {
      const formData = {
        username: values.username,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        dob: values.dob ? values.dob.format("DD-MM-YYYY") : null,
        gender: values.gender,
        bloodType: values.bloodType,
        status: "Active",
      };

      if (modalConfig.type === "edit") {
        await api.put(`v1/staff/${values.staffId}`, formData);
        toast.success("Staff updated successfully");
      } else {
        await api.post("v1/staff", { ...formData, password: values.password });
        toast.success("Staff added successfully");
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(modalConfig.type === "edit" ? "Failed to update staff" : "Failed to add staff");
      console.error(error);
    } finally {
      setModalConfig((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async (staffId) => {
    try {
      await api.delete(`v1/staff/${staffId}`);
      toast.success("Staff deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete staff");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      key: "dob",
      sorter: (a, b) => a.dob.localeCompare(b.dob),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      sorter: (a, b) => a.gender.localeCompare(b.gender),
    },
    {
      title: "Blood Type",
      dataIndex: "bloodType",
      key: "bloodType",
      sorter: (a, b) => a.bloodType.localeCompare(b.bloodType),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>,
    },
    {
      title: "Action",
      dataIndex: "staffId",
      key: "staffId",
      render: (_, record) => (
        <div className="Staff__action">
          <Button
            type="link"
            icon={<EyeOutlined style={{ fontSize: "20px" }} />}
            onClick={() => handleOpenModal("detail", record)}
          />
          <Button type="primary" style={{ marginRight: 10 }} onClick={() => handleOpenModal("edit", record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete staff"
            description="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record.staffId)}
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const renderModalContent = () => {
    if (modalConfig.type === "detail" && selectedStaff) {
      return (
        <div className="staff-details">
          <p>
            <strong>Username:</strong> {selectedStaff.userName}
          </p>
          <p>
            <strong>Email:</strong> {selectedStaff.email}
          </p>
          <p>
            <strong>Full Name:</strong> {selectedStaff.fullName}
          </p>
          <p>
            <strong>Phone:</strong> {selectedStaff.phone}
          </p>
          <p>
            <strong>Address:</strong> {selectedStaff.address}
          </p>
          <p>
            <strong>Date of Birth:</strong> {selectedStaff.dob}
          </p>
          <p>
            <strong>Gender:</strong> {selectedStaff.gender}
          </p>
          <p>
            <strong>Status:</strong> {selectedStaff.status}
          </p>
        </div>
      );
    }

    return (
      <Form form={form} labelCol={{ span: 24 }} onFinish={handleSubmit}>
        <Form.Item label="staffId" name="staffId" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="Username" name="username" rules={[{ required: true, message: "Please input username!" }]}>
          <Input placeholder="Enter username" />
        </Form.Item>
        {modalConfig.type === "add" && (
          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input password!" }]}>
            <Input.Password placeholder="Enter password" />
          </Form.Item>
        )}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: "email", message: "Please enter a valid email!" },
            { required: true, message: "Email is required!" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
        <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: "Please input full name!" }]}>
          <Input placeholder="Enter full name" />
        </Form.Item>
        <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Please input phone number!" }]}>
          <Input placeholder="Enter phone number" />
        </Form.Item>
        <Form.Item label="Address" name="address" rules={[{ required: true, message: "Please input address!" }]}>
          <Input placeholder="Enter address" />
        </Form.Item>
        <Form.Item
          label="Date of Birth"
          name="dob"
          rules={[{ required: true, message: "Please select date of birth!" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Gender" name="gender" rules={[{ required: true, message: "Please select gender!" }]}>
          <Radio.Group>
            <Radio value="Male">Male</Radio>
            <Radio value="Female">Female</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Blood Type"
          name="bloodType"
          rules={[{ required: true, message: "Please select blood type!" }]}
        >
          <Select>
            <Select.Option value="A">A</Select.Option>
            <Select.Option value="B">B</Select.Option>
            <Select.Option value="AB">AB</Select.Option>
            <Select.Option value="O">O</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className="Staff">
      <h1>List of Staff</h1>

      <div className="Staff__above">
        <div style={{ marginBottom: 16, display: "flex", gap: "10px" }}>
          <Input
            placeholder="Search by staff name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            onPressEnter={handleSearch}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Search
          </Button>
        </div>

        <Button type="primary" onClick={() => handleOpenModal("add")}>
          Add New Staff
        </Button>
      </div>

      <Table columns={columns} dataSource={filteredData} rowKey="staffId" scroll={{ x: "max-content", y: 400 }} />

      <Modal
        open={modalConfig.open}
        title={modalConfig.title}
        onCancel={handleCloseModal}
        footer={
          modalConfig.type === "detail"
            ? [
                <Button key="close" onClick={handleCloseModal}>
                  Close
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={handleCloseModal}>
                  Cancel
                </Button>,
                <Button key="submit" type="primary" loading={modalConfig.loading} onClick={() => form.submit()}>
                  Submit
                </Button>,
              ]
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default Staff;
