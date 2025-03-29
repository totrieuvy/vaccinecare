import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Descriptions, 
  Alert, 
  Button,
  Space 
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import VaccineService from '../../../services/VaccineService';
const { Title, Text } = Typography;

const VaccineDetail = () => {
  const { vaccineId } = useParams();
  const navigate = useNavigate();
  const [vaccine, setVaccine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVaccineDetails = async () => {
      try {
        setLoading(true);
        const data = await VaccineService.getVaccineById(vaccineId);
        // data is already the vaccine object from the service
        setVaccine(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch vaccine details');
      } finally {
        setLoading(false);
      }
    };

    if (vaccineId) {
      fetchVaccineDetails();
    }
  }, [vaccineId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Text>Loading vaccine details...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!vaccine) {
    return (
      <div className="p-6">
        <Alert
          message="Not Found"
          description="Vaccine information not found"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Ensure description object exists
  const description = vaccine.description || {};
  const manufacturer = vaccine.manufacturer || {};

  return (
    <div className="p-6">
      <Space direction="vertical" size="large" className="w-full">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        >
          Back to Vaccines
        </Button>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12} lg={8}>
            <Card
              cover={
                <img
                  alt={vaccine.vaccineName}
                  src={vaccine.image}
                  style={{ 
                    height: 300, 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
              }
            >
              <Card.Meta
              
                title={<Title level={4}>{vaccine.vaccineName || 'Unnamed Vaccine'}</Title>}
                description={<Text strong>Price: {formatPrice(vaccine.price || 0)}</Text>}
              />
            </Card>
          </Col>

          <Col xs={24} md={12} lg={16}>
            <Card   title="Vaccine Information" 
              className="h-full"
              style={{
                border: '1px solid black',
                borderRadius: '12px'
              }}
              headStyle={{
                backgroundColor: '#9989C5',
                color: 'white',
                borderTopLeftRadius: '10px',  
                borderTopRightRadius: '10px',
              }}
              >
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item label="Information" span={2}>
                  {description.info || 'No information available'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Target Patients" span={2}>
                  {description.targetedPatient || 'Not specified'}
                </Descriptions.Item>

                <Descriptions.Item label="Injection Schedule" span={2}>
                  {description.injectionSchedule || 'Not specified'}
                </Descriptions.Item>

                <Descriptions.Item label="Possible Reactions" span={2}>
                  {description.vaccineReaction || 'Not specified'}
                </Descriptions.Item>

                <Descriptions.Item label="Age Range">
                  {vaccine.minAge || 0} - {vaccine.maxAge || 0} years
                </Descriptions.Item>

                <Descriptions.Item label="Number of Doses">
                  {vaccine.numberDose || 'Not specified'}
                </Descriptions.Item>

                <Descriptions.Item label="Duration">
                  {vaccine.duration || 0} {vaccine.unit || 'days'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24}>
            <Card title="Manufacturer Information"
              className="h-full"
              style={{
                border: '1px solid black',
                borderRadius: '12px'
              }}
              headStyle={{
                backgroundColor: '#9989C5',
                color: 'white',
                borderTopLeftRadius: '10px',  
                borderTopRightRadius: '10px',
              }}
            >
                
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item label="Manufacturer">
                  {manufacturer.name || 'Not specified'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Country">
                  {manufacturer.countryName || 'Not specified'}
                </Descriptions.Item>

                <Descriptions.Item label="Description" span={2}>
                  {manufacturer.description || 'No description available'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default VaccineDetail;