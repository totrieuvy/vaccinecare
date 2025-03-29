import {
  Table,
  Tag,
  Input,
  Button,
  Modal,
  Image,
  Form,
  InputNumber,
  Select,
  Upload,
  Popconfirm,
  Col,
  Row,
  Descriptions,
} from "antd";
import { useEffect, useState } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import "./Vaccine.scss";
import { formatVND } from "../../../utils/currencyFormat";
import { useForm } from "antd/es/form/Form";
import uploadFile from "../../../utils/upload";
import { toast } from "react-toastify";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as XLSX from "xlsx";

if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

pdfMake.fonts = {
  Roboto: {
    normal: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

function Vaccine() {
  const [dataSource, setDataSource] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [manufacturers, setManufacturers] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const uploadButton = (
    <div className="upload-button">
      <PlusOutlined />
      <div>Upload</div>
    </div>
  );

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const fetchData = async () => {
    try {
      const response = await api.get("v1/vaccine?pageIndex=1&pageSize=10000");
      const listManufacturers = await api.get("v1/manufacturer");
      setManufacturers(listManufacturers.data.data);
      const sortedData = response.data.data.sort((a, b) => a.minAge - b.minAge);
      setDataSource(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
    document.title = "Vaccine Management";
  }, []);

  const handleSearch = () => {
    const filtered = dataSource.filter((item) => item.vaccineName.toLowerCase().includes(searchText.toLowerCase()));
    setFilteredData(filtered);
  };

  const columns = [
    {
      title: "Tên Vaccine",
      dataIndex: "vaccineName",
      key: "vaccineName",
      sorter: (a, b) => a.vaccineName.localeCompare(b.vaccineName),
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => <Image src={text} alt="Vaccine" className="vaccine-image" />,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: ["manufacturers", 0, "name"],
      key: "manufacturer",
      sorter: (a, b) => a.manufacturers[0].name.localeCompare(b.manufacturers[0].name),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => formatVND(price),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>,
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Hành động",
      dataIndex: "vaccineId",
      key: "vaccineId",
      render: (vaccineId, record) => (
        <div className="action-buttons">
          <Button className="detail-btn" onClick={() => handleDetail(record)}>
            Chi tiết
          </Button>
          <Button
            className="edit-btn"
            onClick={() => {
              setIsUpdate(true);
              form.setFieldsValue({
                ...record,
                manufacturerId: record.manufacturers[0]?.manufacturerId || null,
              });
              setOpen(true);
              if (record.image) {
                setFileList([{ name: "image.png", status: "done", url: record.image }]);
              }
            }}
          >
            Chỉnh sửa
          </Button>
          <Popconfirm
            title="Delete Vaccine"
            description="Are you sure you want to delete this vaccine?"
            onConfirm={() => handleDelete(vaccineId)}
          >
            <Button className="delete-btn">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDelete = async (vaccineId) => {
    try {
      await api.delete(`v1/vaccine/${vaccineId}`);
      toast.success("Vaccine deleted successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete vaccine");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
    setFileList([]);
  };

  const handleOpenModal = () => {
    form.resetFields();
    setOpen(true);
    setIsUpdate(false);
    setFileList([]);
  };

  const handleSubmitForm = async (values) => {
    setLoading(true);
    try {
      if (values.image?.file) {
        const url = await uploadFile(values.image.file.originFileObj);
        values.image = url;
      }

      const payload = {
        vaccineName: values.vaccineName,
        description: {
          info: values.description?.info,
          targetedPatient: values.description?.targetedPatient,
          vaccineReaction: values.description?.vaccineReaction,
        }, // Removed injectionSchedule
        minAge: values.minAge,
        maxAge: values.maxAge,
        numberDose: values.numberDose,
        duration: values.duration,
        unit: values.unit,
        image: values.image,
        manufacturerId: values.manufacturerId,
        price: values.price,
        isActive: true,
      };

      if (isUpdate) {
        await api.put(`v1/vaccine/${values.vaccineId}`, payload);
        toast.success("Vaccine updated successfully");
      } else {
        await api.post("v1/vaccine", payload);
        toast.success("Vaccine added successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Operation failed");
    } finally {
      fetchData();
      handleCancel();
      setLoading(false);
    }
  };

  const handleDetail = (record) => {
    setSelectedVaccine(record);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedVaccine(null);
  };

  const exportPDF = () => {
    const docDefinition = {
      content: [
        { text: "Vaccine List", style: "header" },
        { text: `Export Date: ${new Date().toLocaleDateString()}`, style: "subheader" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "auto", "auto", "auto", "*"],
            body: [
              ["Vaccine Name", "Manufacturer", "Price", "Min Age", "Max Age", "Doses", "Status"],
              ...filteredData.map((item) => [
                item.vaccineName,
                item.manufacturers[0]?.name || "N/A",
                formatVND(item.price),
                item.minAge.toString(),
                item.maxAge.toString(),
                item.numberDose.toString(),
                item.isActive ? "Active" : "Inactive",
              ]),
            ],
          },
        },
        { text: `Total Vaccines: ${filteredData.length}`, style: "summary" },
        { text: `Active Vaccines: ${filteredData.filter((item) => item.isActive).length}`, style: "summary" },
        { text: `Inactive Vaccines: ${filteredData.filter((item) => !item.isActive).length}`, style: "summary" },
      ],
      styles: {
        header: { fontSize: 20, bold: true, margin: [0, 0, 0, 20] },
        subheader: { fontSize: 12, margin: [0, 0, 0, 20] },
        summary: { fontSize: 12, margin: [0, 10, 0, 0] },
      },
      defaultStyle: { font: "Roboto" },
    };
    pdfMake.createPdf(docDefinition).download("vaccine-list.pdf");
    toast.success("PDF exported successfully");
  };

  const exportExcel = () => {
    try {
      const excelData = filteredData.map((item) => ({
        "Vaccine Name": item.vaccineName,
        Manufacturer: item.manufacturers[0]?.name || "N/A",
        Price: formatVND(item.price),
        "Min Age (months)": item.minAge,
        "Max Age (months)": item.maxAge,
        "Number of Doses": item.numberDose,
        "Duration (days)": item.duration,
        Status: item.isActive ? "Active" : "Inactive",
        Information: item.description?.info || "",
        "Targeted Patients": item.description?.targetedPatient || "",
        "Vaccine Reaction": item.description?.vaccineReaction || "", // Removed injectionSchedule
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = Object.keys(excelData[0]).map((key) => ({
        wch: Math.max(key.length, ...excelData.map((item) => String(item[key]).length)) + 5,
      }));
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Vaccines");

      const summary = [
        ["Export Date:", new Date().toLocaleDateString()],
        ["Total Vaccines:", filteredData.length],
        ["Active Vaccines:", filteredData.filter((item) => item.isActive).length],
        ["Inactive Vaccines:", filteredData.filter((item) => !item.isActive).length],
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summary);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      XLSX.writeFile(wb, "vaccine-list.xlsx");
      toast.success("Excel exported successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to export Excel");
    }
  };

  return (
    <div className="Vaccine">
      <h1>Vaccine Management</h1>
      <div className="Vaccine__above">
        <div className="search-section">
          <Input
            placeholder="Search by vaccine name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div className="action-section">
          <Button className="export-btn" onClick={exportPDF}>
            Export PDF
          </Button>
          <Button className="export-btn" onClick={exportExcel}>
            Export Excel
          </Button>
          <Button type="primary" onClick={handleOpenModal}>
            Add Vaccine
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="vaccineId"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        className="vaccine-table"
      />

      <Modal
        open={open}
        title={isUpdate ? "Update Vaccine" : "Add New Vaccine"}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={900}
        className="vaccine-modal"
      >
        <Form form={form} onFinish={handleSubmitForm} layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="vaccineId" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="vaccineName"
                label="Vaccine Name"
                rules={[{ required: true, message: "Please enter vaccine name" }]}
              >
                <Input placeholder="Enter vaccine name" />
              </Form.Item>
              <Form.Item
                name={["description", "info"]}
                label="Information"
                rules={[{ required: true, message: "Please enter information" }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item
                name="manufacturerId"
                label="Manufacturer"
                rules={[{ required: true, message: "Please select manufacturer" }]}
              >
                <Select disabled={isUpdate} placeholder="Select manufacturer">
                  {manufacturers.map((m) => (
                    <Select.Option key={m.manufacturerId} value={m.manufacturerId}>
                      {m.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="price" label="Price (VND)" rules={[{ required: true, message: "Please enter price" }]}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["description", "targetedPatient"]}
                label="Targeted Patients"
                rules={[{ required: true, message: "Please enter targeted patients" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["description", "vaccineReaction"]}
                label="Vaccine Reaction"
                rules={[{ required: true, message: "Please enter vaccine reaction" }]}
              >
                <Input />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="minAge"
                    label="Min Age (months)"
                    rules={[
                      { required: true, message: "Required" },
                      { type: "number", min: 0, message: "Min age must be 0" },
                    ]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxAge"
                    label="Max Age (months)"
                    rules={[
                      { required: true, message: "Required" },
                      { type: "number", min: 0, max: 96, message: "0-96 months" },
                    ]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="numberDose"
                    label="Number of Doses"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber style={{ width: "100%" }} min={1} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="duration" label="Duration (days)" rules={[{ required: true, message: "Required" }]}>
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Form.Item name="image" label="Image" rules={[{ required: true, message: "Please upload an image" }]}>
            <Upload listType="picture-card" fileList={fileList} onPreview={handlePreview} onChange={handleChange}>
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết Vaccine"
        open={detailOpen}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>
            Đóng
          </Button>,
        ]}
        width={600}
        className="vaccine-detail"
      >
        {selectedVaccine && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Vaccine ID">{selectedVaccine.vaccineId}</Descriptions.Item>
            <Descriptions.Item label="Tên Vaccine">{selectedVaccine.vaccineName}</Descriptions.Item>
            <Descriptions.Item label="Hình ảnh">
              <Image
                src={selectedVaccine.image}
                alt="vaccine"
                style={{
                  maxWidth: 200,
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Nhà sản xuất">
              {selectedVaccine.manufacturers[0]?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Quốc gia">
              {selectedVaccine.manufacturers[0]?.countryName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá">{formatVND(selectedVaccine.price)}</Descriptions.Item>
            <Descriptions.Item label="Thông tin">{selectedVaccine.description?.info}</Descriptions.Item>
            <Descriptions.Item label="Đối tượng">{selectedVaccine.description?.targetedPatient}</Descriptions.Item>
            <Descriptions.Item label="Phản ứng">{selectedVaccine.description?.vaccineReaction}</Descriptions.Item>
            <Descriptions.Item label="Độ tuổi">
              {selectedVaccine.minAge} - {selectedVaccine.maxAge} tháng
            </Descriptions.Item>
            <Descriptions.Item label="Số liều">{selectedVaccine.numberDose}</Descriptions.Item>
            <Descriptions.Item label="Khoảng cách tiêm giữa các mũi">{selectedVaccine.duration} ngày</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedVaccine.isActive ? "Đang hoạt động" : "Không hoạt động"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Image
        wrapperStyle={{ display: "none" }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          afterOpenChange: (visible) => !visible && setPreviewImage(""),
        }}
        src={previewImage}
      />
    </div>
  );
}

export default Vaccine;
