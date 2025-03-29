import React, { useState } from 'react';
import { Row, Col, Card, Segmented, ConfigProvider } from 'antd';
import FilterCarousel from '../../../components/FilterCarousel.jsx/FilterCarousel';

const VaccineInfoTest = () => {
  const [selectedSection, setSelectedSection] = useState('Info');

  const InfoContent = () => (
    <Card 
      title="Vaccine Information" 
      className="h-full"
      headStyle={{ backgroundColor: '#65558F', color: '#ffffff' }}
    >
      <p>General information about the vaccine, including:</p>
      <ul>
        <li>Vaccine type and composition</li>
        <li>Manufacturer details</li>
        <li>Storage requirements</li>
        <li>Administration method</li>
      </ul>
    </Card>
  );

  const TargetedPatientContent = () => (
    <Card 
      title="Targeted Patient Information" 
      className="h-full"
      headStyle={{ backgroundColor: '#65558F', color: '#ffffff' }}
    >
      <p>Patient eligibility criteria:</p>
      <ul>
        <li>Age groups</li>
        <li>Health conditions</li>
        <li>Contraindications</li>
        <li>Special considerations</li>
      </ul>
    </Card>
  );

  const InjectionScheduleContent = () => (
    <Card 
      title="Injection Schedule" 
      className="h-full"
      headStyle={{ backgroundColor: '#65558F', color: '#ffffff' }}
    >
      <p>Vaccination schedule details:</p>
      <ul>
        <li>Number of doses required</li>
        <li>Timing between doses</li>
        <li>Recommended age for each dose</li>
        <li>Catch-up scheduling</li>
      </ul>
    </Card>
  );

  const VaccineReactionsContent = () => (
    <Card 
      title="Vaccine Reactions" 
      className="h-full"
      headStyle={{ backgroundColor: '#65558F', color: '#ffffff' }}
    >
      <p>Possible reactions and side effects:</p>
      <ul>
        <li>Common side effects</li>
        <li>Rare side effects</li>
        <li>When to seek medical attention</li>
        <li>Recovery period</li>
      </ul>
    </Card>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'Info':
        return <InfoContent />;
      case 'Targeted Patient':
        return <TargetedPatientContent />;
      case 'Injection Schedule':
        return <InjectionScheduleContent />;
      case 'Vaccine Reactions':
        return <VaccineReactionsContent />;
      default:
        return <InfoContent />;
    }
  };

  return (
    <>
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            itemSelectedBg: '#65558F',
            itemSelectedColor: '#ffffff',
          },
          Card: {
            headerBg: '#65558F',
            headerColor: '#ffffff',
          }
        },
      }}
    >
      <Row gutter={[16, 16]} className="min-h-screen p-4">
        {/* Left Column - Options */}
        <Col xs={24} md={8} lg={6}>
          <Card 
            title="Options" 
            headStyle={{ backgroundColor: '#65558F', color: '#ffffff' }}
          >
            <div className="flex flex-col gap-4 p-2">
              {['Info', 'Targeted Patient', 'Injection Schedule', 'Vaccine Reactions'].map((option) => (
                <Segmented
                  key={option}
                  options={[option]}
                  value={selectedSection}
                  onChange={setSelectedSection}
                  block
                  className={`h-14 ${selectedSection === option ? 'bg-[#65558F] text-white' : 'hover:bg-gray-100'}`}
                  style={{
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </Card>
        </Col>

        {/* Right Column - Content */}
        <Col xs={24} md={16} lg={18}>
          <div className="h-full">
            {renderContent()}
          </div>
        </Col>
      </Row>
    </ConfigProvider>
    </>

  );
};

export default VaccineInfoTest;