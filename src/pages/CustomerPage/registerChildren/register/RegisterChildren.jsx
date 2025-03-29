import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, DatePicker, Radio, Button, Card, Select } from "antd";
import { UserOutlined, CalendarOutlined, HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "./RegisterChildren.scss";
import api from "../../../../config/axios";
import { useSelector } from "react-redux";

const { Option } = Select;

const RegisterChildren = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const user = useSelector((state) => state.user);
  const token = localStorage.getItem("token");

  // State for address dropdowns
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch provinces on component mount
    fetchProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch provinces data
  const fetchProvinces = async () => {
    try {
      setLoading((prev) => ({ ...prev, provinces: true }));
      const response = await api.get("province");
      if (response.data && response.data.data) {
        setProvinces(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast.error("Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }));
    }
  };

  // Fetch districts based on selected province
  const fetchDistricts = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, districts: true }));
      const response = await api.get(`district/${provinceId}`);
      if (response.data && response.data.data) {
        setDistricts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  // Fetch wards based on selected district
  const fetchWards = async (districtId) => {
    if (!districtId) {
      setWards([]);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, wards: true }));
      const response = await api.get(`ward/${districtId}`);
      if (response.data && response.data.data) {
        setWards(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoading((prev) => ({ ...prev, wards: false }));
    }
  };

  // Handle province change
  const handleProvinceChange = (value, option) => {
    setSelectedProvince(option);
    setSelectedDistrict(null);
    form.setFieldsValue({ district: undefined, ward: undefined });
    fetchDistricts(value);
  };

  // Handle district change
  const handleDistrictChange = (value, option) => {
    setSelectedDistrict(option);
    form.setFieldsValue({ ward: undefined });
    fetchWards(value);
  };

  const onFinish = async (values) => {
    try {
      // Get the text values for address components
      const provinceName = selectedProvince?.children || "";
      const districtName = selectedDistrict?.children || "";
      const wardName = values.ward ? wards.find((w) => w.id === values.ward)?.full_name || "" : "";

      // Combine detailed address with administrative units
      const fullAddress = [values.detailAddress, wardName, districtName, provinceName].filter(Boolean).join(", ");

      const formattedData = {
        userId: user.userId,
        fullName: values.fullName,
        dob: values.dob.format("DD-MM-YYYY"),
        gender: values.gender,
        address: fullAddress,
        provinceId: values.province,
        districtId: values.district,
        wardId: values.ward,
      };

      const response = await api.post("user/child", formattedData);

      if (response.data) {
        form.resetFields();
        toast.success("Đăng ký hồ sơ trẻ thành công!");
      }
    } catch (error) {
      console.error("Error registering child:", error);
      toast.error("Đăng ký hồ sơ trẻ không thành công. Vui lòng thử lại sau!");
    }
  };

  return (
    <div className="RegisterChildren">
      <div className="max-w-md w-full mx-auto">
        <Card>
          <div className="title">
            <h1>Đăng kí hồ sơ trẻ em</h1>
            <h3>Hãy điền thông tin trẻ vào form bên dưới</h3>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              gender: "Male",
            }}
          >
            <Form.Item name="userId" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Hãy nhập đầy đủ họ và tên trẻ em!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Họ và tên trẻ em" />
            </Form.Item>

            <Form.Item
              label="Ngày sinh"
              name="dob"
              rules={[{ required: true, message: "Hãy nhập đầy đủ ngày sinh của trẻ em!" }]}
            >
              <DatePicker
                className="w-full"
                format="DD-MM-YYYY"
                prefix={<CalendarOutlined />}
                placeholder="Chọn ngày sinh"
                disabledDate={(current) => current && current > dayjs().endOf("day")}
              />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Hãy nhập đầy đủ giới tính của trẻ!" }]}
            >
              <Radio.Group>
                <Radio.Button value="Male">Nam</Radio.Button>
                <Radio.Button value="Female">Nữ</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {/* Province Dropdown */}
            <Form.Item
              label="Tỉnh/Thành phố"
              name="province"
              rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" }]}
            >
              <Select
                placeholder="Chọn Tỉnh/Thành phố"
                onChange={handleProvinceChange}
                loading={loading.provinces}
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {provinces.map((province) => (
                  <Option key={province.id} value={province.id}>
                    {province.full_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* District Dropdown */}
            <Form.Item
              label="Quận/Huyện"
              name="district"
              rules={[{ required: true, message: "Vui lòng chọn Quận/Huyện!" }]}
            >
              <Select
                placeholder="Chọn Quận/Huyện"
                onChange={handleDistrictChange}
                loading={loading.districts}
                disabled={!form.getFieldValue("province")}
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {districts.map((district) => (
                  <Option key={district.id} value={district.id}>
                    {district.full_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Ward Dropdown */}
            <Form.Item label="Phường/Xã" name="ward" rules={[{ required: true, message: "Vui lòng chọn Phường/Xã!" }]}>
              <Select
                placeholder="Chọn Phường/Xã"
                loading={loading.wards}
                disabled={!form.getFieldValue("district")}
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {wards.map((ward) => (
                  <Option key={ward.id} value={ward.id}>
                    {ward.full_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Detailed Address */}
            <Form.Item
              label="Địa chỉ chi tiết"
              name="detailAddress"
              rules={[{ required: true, message: "Hãy nhập địa chỉ chi tiết!" }]}
            >
              <Input.TextArea
                prefix={<HomeOutlined />}
                placeholder="Số nhà, tên đường, tòa nhà, khu dân cư, v.v."
                rows={2}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Đăng kí hồ sơ trẻ em
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterChildren;
