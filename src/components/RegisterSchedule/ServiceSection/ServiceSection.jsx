import { useState } from "react";
import { Form, Segmented, Card, Row, Col, ConfigProvider, Button } from "antd";
import VaccinationPackageSection from "./VaccinationPackageSection/VaccinationPackageSection";
import SingleVaccinationSection from "./SingleInjectionSection/SingleVaccinationSection";

export default function ServiceSection() {
  // Khởi tạo serviceType với giá trị mặc định là "Vaccination Package"
  const [serviceType, setServiceType] = useState("Vaccination Package");

  const handleServiceTypeChange = (value) => {
    setServiceType(value);
  };

  return (
    <div className="flex flex-col items-center">
      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemSelectedBg: "#65558F",
              itemSelectedColor: "#ffffff",
            },
            Collapse: {
              headerBg: "#f8f8f8",
              contentBg: "#ffffff",
            },
          },
        }}
      >
        <Card
          title="Service Info"
          className="max-w-6xl w-full mx-auto mt-4"
          headStyle={{
            backgroundColor: "#65558F",
            color: "#ffffff",
          }}
        >
          <Form layout="vertical" requiredMark={false} name="service">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={8}>
                <Form.Item
                  label="Select vaccine type"
                  name="vaccineType"
                  rules={[{ required: true, message: "Please select your vaccine type" }]}
                >
                  <Segmented
                    options={["Vaccination Package", "Single Vaccination"]}
                    block
                    style={{ width: "100%" }}
                    onChange={handleServiceTypeChange}
                    value={serviceType} // Đồng bộ giá trị với state
                  />
                </Form.Item>
              </Col>
            </Row>

            {serviceType === "Vaccination Package" && <VaccinationPackageSection />}
            {serviceType === "Single Vaccination" && <SingleVaccinationSection />}
            <br />
          </Form>
        </Card>
        <br />
        <div className="w-full max-w-6xl flex justify-end mt-4 mb-8">
          <Button
            type="primary"
            size="large"
            style={{
              backgroundColor: "#65558F",
              color: "#ffffff",
            }}
            className="hover:opacity-90"
          >
            Next
          </Button>
        </div>
      </ConfigProvider>
    </div>
  );
}
