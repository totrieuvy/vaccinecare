/* eslint-disable react/prop-types */
import {
  Button,
  Image,
  Input,
  Table,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Select,
  message,
  Descriptions,
  Popconfirm,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import api from "../../../config/axios";
import { toast } from "react-toastify";

function Batch() {
  const [batches, setBatches] = useState([]); // Đổi tên biến "patchs" thành "batches" cho đúng ngữ nghĩa
  const [vaccines, setVaccines] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Batch";
  }, []);

  const columns = [
    {
      title: "Tên Vaccine",
      dataIndex: ["vaccine", "vaccineName"],
      key: "vaccineName",
    },
    {
      title: "Hình ảnh",
      dataIndex: ["vaccine", "image"],
      key: "image",
      render: (image) => (
        <Image
          src={image}
          alt="vaccine"
          style={{
            width: 50,
            height: 50,
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
      ),
    },
    {
      title: "Nhà sản xuất",
      dataIndex: ["vaccine", "manufacturers", 0, "name"], // Sửa từ "manufacturer" thành "manufacturers[0]"
      key: "manufacturerName",
    },
    {
      title: "Quốc gia",
      dataIndex: ["vaccine", "manufacturers", 0, "countryName"], // Sửa từ "manufacturer" thành "manufacturers[0]"
      key: "countryName",
    },
    {
      title: "Giá",
      dataIndex: ["vaccine", "price"],
      key: "price",
      render: (price) =>
        price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "productionDate",
      key: "productionDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) =>
        isActive ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Không hoạt động</Tag>,
    },
    {
      title: "Hành động",
      dataIndex: "batchId",
      key: "batchId",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button type="primary" onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa batch này không?"
            onConfirm={() => handleDelete(record.batchId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleViewDetail = (batch) => {
    setSelectedBatch(batch);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (batchId) => {
    try {
      setLoading(true);
      await api.delete(`v1/batch/${batchId}`);
      toast.success("Xóa batch thành công");
      fetchData();
    } catch (error) {
      console.error("Lỗi khi xóa batch:", error);
      toast.error("Xóa batch thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (batch) => {
    setIsEdit(true);
    setIsModalOpen(true);
    setEditingBatch(batch);

    form.setFieldsValue({
      batchId: batch.batchId,
      vaccine: {
        key: batch.vaccine.vaccineId,
        value: batch.vaccine.vaccineId,
        label: batch.vaccine.vaccineName,
      },
      productionDate: dayjs(batch.productionDate),
      expirationDate: dayjs(batch.expirationDate),
      quantity: batch.quantity,
      isActive: batch.isActive,
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const responseBatch = await api.get("v1/batch");
      setBatches(responseBatch.data.data); // Đổi từ "patchs" thành "batches"
      setFilteredData(responseBatch.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu batch:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      const responseVaccine = await api.get("v1/vaccine?pageIndex=1&pageSize=1000");
      setVaccines(responseVaccine.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu vaccine:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchVaccines();
  }, []);

  const handleSearch = () => {
    const keyword = searchText.toLowerCase();
    const filtered = batches.filter((item) => {
      const vaccineName = item.vaccine?.vaccineName?.toLowerCase() || "";
      const manufacturerName = item.vaccine?.manufacturers[0]?.name?.toLowerCase() || ""; // Sửa từ "manufacturer" thành "manufacturers[0]"
      return vaccineName.includes(keyword) || manufacturerName.includes(keyword);
    });
    setFilteredData(filtered);
  };

  const handleAddNew = () => {
    setIsModalOpen(true);
    setIsEdit(false);
    setEditingBatch(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const vaccineId = values.vaccine?.value || values.vaccine?.key;

      const payload = {
        vaccineId: vaccineId,
        productionDate: values.productionDate.format("YYYY-MM-DD"),
        expirationDate: values.expirationDate.format("YYYY-MM-DD"),
        quantity: values.quantity,
        isActive: true,
      };

      if (isEdit) {
        if (!editingBatch?.batchId) {
          toast.error("Không tìm thấy batch ID để cập nhật");
          return;
        }
        await api.put(`v1/batch/${editingBatch.batchId}`, payload); // Không cần gửi batchId trong payload khi PUT
        toast.success("Cập nhật batch thành công");
      } else {
        payload.batchId = values.batchId; // Thêm batchId vào payload khi tạo mới
        await api.post("v1/batch", payload);
        toast.success("Thêm mới batch thành công");
      }

      fetchData();
      setIsModalOpen(false);
      form.resetFields();
      setIsEdit(false);
      setEditingBatch(null);
    } catch (error) {
      console.error("Lỗi:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setEditingBatch(null);
    form.resetFields();
  };

  const availableVaccines = isEdit
    ? [...vaccines, vaccines.find((v) => v.vaccineId === editingBatch?.vaccine?.vaccineId)].filter(Boolean)
    : vaccines;

  const DetailModal = ({ batch, visible, onClose }) => {
    if (!batch) return null;

    return (
      <Modal
        title="Chi tiết Batch"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Batch ID">{batch.batchId}</Descriptions.Item>
          <Descriptions.Item label="Tên Vaccine">{batch.vaccine.vaccineName}</Descriptions.Item>
          <Descriptions.Item label="Hình ảnh">
            <Image
              src={batch.vaccine.image}
              alt="vaccine"
              style={{
                maxWidth: 200,
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Nhà sản xuất">
            {batch.vaccine.manufacturers[0]?.name || "N/A"} {/* Sửa từ "manufacturer" thành "manufacturers[0]" */}
          </Descriptions.Item>
          <Descriptions.Item label="Quốc gia">
            {batch.vaccine.manufacturers[0]?.countryName || "N/A"}{" "}
            {/* Sửa từ "manufacturer" thành "manufacturers[0]" */}
          </Descriptions.Item>
          <Descriptions.Item label="Giá">
            {batch.vaccine.price.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng">{batch.quantity}</Descriptions.Item>
          <Descriptions.Item label="Ngày sản xuất">
            {new Date(batch.productionDate).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày hết hạn">
            {new Date(batch.expirationDate).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {batch.isActive ? "Đang hoạt động" : "Không hoạt động"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  return (
    <div>
      <h1>Danh sách vaccine và nhà cung cấp</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div className="search" style={{ display: "flex", gap: "10px" }}>
          <Input
            placeholder="Tìm kiếm theo tên vaccine hoặc nhà sản xuất"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            onPressEnter={handleSearch}
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>
        <div className="add">
          <Button type="primary" onClick={handleAddNew}>
            Thêm mới số lượng
          </Button>
        </div>
      </div>

      <Table dataSource={filteredData} columns={columns} rowKey="batchId" loading={loading} />

      <Modal
        title={isEdit ? "Cập nhật số lượng" : "Thêm mới số lượng"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          {!isEdit && (
            <Form.Item label="Batch ID" name="batchId" rules={[{ required: true, message: "Vui lòng nhập Batch ID" }]}>
              <Input placeholder="Nhập Batch ID" />
            </Form.Item>
          )}

          <Form.Item label="Tên Vaccine" name="vaccine" rules={[{ required: true, message: "Vui lòng chọn vaccine" }]}>
            <Select
              placeholder="Chọn vaccine"
              disabled={isEdit}
              labelInValue
              showSearch
              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {availableVaccines.map((vaccine) => (
                <Select.Option key={vaccine.vaccineId} value={vaccine.vaccineId}>
                  {vaccine.vaccineName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày sản xuất"
            name="productionDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sản xuất" },
              {
                validator: (_, value) => {
                  if (value && value.isAfter(dayjs())) {
                    return Promise.reject("Ngày sản xuất không thể sau ngày hiện tại");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Ngày hết hạn"
            name="expirationDate"
            dependencies={["productionDate"]}
            rules={[
              { required: true, message: "Vui lòng chọn ngày hết hạn" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const productionDate = getFieldValue("productionDate");
                  if (!value || !productionDate || value.isAfter(productionDate)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Ngày hết hạn phải sau ngày sản xuất"));
                },
              }),
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
        </Form>
      </Modal>

      <DetailModal
        batch={selectedBatch}
        visible={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBatch(null);
        }}
      />
    </div>
  );
}

export default Batch;
