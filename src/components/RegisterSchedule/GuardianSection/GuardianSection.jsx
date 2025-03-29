import React from 'react';
import { Form, Input, Select, Card, Row, Col } from 'antd';

const GuardianSection = () => {
  const relationships = [
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' }
  ];

  return (
    <Card title="Guardian Info" className="max-w-6xl mx-auto mt-4"
    headStyle={{ 
      backgroundColor: '#65558F', 
      color: '#ffffff'
    }}
    >
      <Form
        layout="vertical"
        requiredMark={false}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Guardian Name"
              name="guardianName"
              rules={[{ required: true, message: 'Please input guardian name' }]}
            >
              <Input placeholder="guardian name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Contact Number"
              name="contactNumber"
              rules={[{ required: true, message: 'Please input contact number' }]}
            >
              <Input placeholder="contact number" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Relationship"
              name="relationship"
              rules={[{ required: true, message: 'Please select relationship' }]}
            >
              <Select
                placeholder="select relationship"
                options={relationships}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default GuardianSection;