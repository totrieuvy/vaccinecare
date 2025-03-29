import { Button, Form, Input, Modal, Popconfirm, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import api from "../../../config/axios";
import { SearchOutlined } from "@ant-design/icons";

import "./Manufacture.scss";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";

function Manufacture() {
  const [dataSource, setDataSource] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get("v1/manufacturer");
      const sortedData = response.data.data.sort((a, b) => b.isActive - a.isActive);

      if (Array.isArray(response.data.data)) {
        setDataSource(sortedData);
        setFilteredData(sortedData);
      } else {
        console.error("Expected an array but received:", response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    document.title = "Manufacture";
    fetchData();
  }, []);

  const columns = [
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tên viết tắt",
      dataIndex: "shortName",
      key: "shortName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Tên quốc gia",
      dataIndex: "countryName",
      key: "countryName",
    },
    {
      title: "Tình trạng",
      dataIndex: "isActive",
      key: "isActive",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.isActive - b.isActive,
      render: (isActive) => <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "InActive"}</Tag>,
    },
    {
      title: "Hành động",
      dataIndex: "manufacturerId",
      key: "manufacturerId",
      render: (manufacturerId, record) => {
        return (
          <>
            <Button
              type="primary"
              onClick={() => {
                setOpen(true);
                form.setFieldsValue(record);
                setIsUpdate(true);
              }}
            >
              Cập nhật
            </Button>
            <Popconfirm
              title="Delete manufacture?"
              description="Are you sure to delete this manufacture"
              onConfirm={() => handleDelete(manufacturerId)}
            >
              <Button type="primary" danger>
                Xóa
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const handleDelete = async (manufacturerId) => {
    try {
      await api.delete(`v1/manufacturer/${manufacturerId}`);
      toast.success("Manufacture deleted successfully!");
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    const filtered = dataSource.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
    setFilteredData(filtered);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOpenModal = () => {
    form.resetFields();
    setIsUpdate(false);
    setOpen(true);
  };

  const handleSubmit = async (values) => {
    console.log(values);
    setLoading(true);
    try {
      if (values.manufacturerId) {
        await api.put(`v1/manufacturer/${values.manufacturerId}`, {
          name: values.name,
          shortName: values.shortName,
          description: values.description,
          countryName: values.countryName,
          countryCode: values.countryCode,
          isActive: true,
        });
        toast.success("Manufacture updated successfully!");
        fetchData();
      } else {
        await api.post("v1/manufacturer", {
          name: values.name,
          shortName: values.shortName,
          description: values.description,
          countryName: values.countryName,
          countryCode: values.countryCode,
          isActive: true,
        });
        toast.success("Manufacture added successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      form.resetFields();
      setLoading(false);
      handleCancel();
    }
  };

  return (
    <div className="Manufacture">
      <h1>Quản lí nhà cung cấp</h1>
      <div className="Staff__above">
        <div style={{ marginBottom: 16, display: "flex", gap: "10px" }}>
          <Input
            placeholder="Nhập tên nhà cung cấp"
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
            Thêm nhà cung cấp mới
          </Button>
        </div>
      </div>
      <Table dataSource={filteredData} columns={columns} rowKey="manufacturerId" />
      <Modal
        open={open}
        title={`${isUpdate ? "Update" : "Add"} manufacture`}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Return
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
            Submit
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} labelCol={{ span: 24 }}>
          <Form.Item label="manufacturerId" name="manufacturerId" hidden>
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter name!" }]}>
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            label="Short Name"
            name="shortName"
            rules={[{ required: true, message: "Please enter short name!" }]}
          >
            <Input placeholder="Enter short name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description!" }]}
          >
            <Input.TextArea placeholder="Enter description" rows={3} />
          </Form.Item>

          <Form.Item
            label="Country Name"
            name="countryName"
            rules={[{ required: true, message: "Please enter country name!" }]}
          >
            <Input placeholder="Enter country name" />
          </Form.Item>

          <Form.Item
            label="Country Code"
            name="countryCode"
            rules={[{ required: true, message: "Please enter country code!" }]}
          >
            <Input placeholder="Enter country code" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Manufacture;
