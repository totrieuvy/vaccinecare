import React from 'react';
import { Breadcrumb, Button, Input, Carousel } from 'antd';
import { SearchOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import './FilterCarousel.css';

const { Search } = Input;

const FilterCarousel = () => {
  const carouselRef = React.useRef();

  const items = [
    { icon: "🦠", title: "VẮC XIN PHÒNG LAO" },
    { icon: "🦠", title: "VẮC XIN PHÒNG UNG" },
    { icon: "🦠", title: "VẮC XIN UỐN VÁN" },
    { icon: "🦠", title: "VẮC XIN VIÊM GAN B" },
    { icon: "🦠", title: "VẮC XIN THƯƠNG HÀN" },
    { icon: "🦠", title: "VẮC XIN PHÒNG TÁ" },
  ];

  const next = () => {
    carouselRef.current.next();
  };

  const previous = () => {
    carouselRef.current.prev();
  };

  return (
    <div className="filter-carousel">
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { title: 'Trang chủ' },
            { title: 'Thông tin sản phẩm vắc xin' },
          ]}
        />
      </div>

      <div className="content-container">
        <h1>Thông tin sản phẩm vắc xin</h1>
        
        <div className="button-group">
          <Button type="primary" className="filter-button">
            VẮC XIN THEO NHÓM BỆNH
          </Button>
          <Button type="primary" className="filter-button orange">
            VẮC XIN THEO ĐỘ TUỔI
          </Button>
        </div>

        <Search
          placeholder="ad"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          className="search-bar"
        />

        <div className="carousel-container">
          <Button 
            className="carousel-button prev" 
            icon={<LeftOutlined />} 
            onClick={previous}
          />
          <Carousel ref={carouselRef} dots={true}>
            <div className="carousel-slide">
              {items.slice(0, 6).map((item, index) => (
                <div key={index} className="carousel-item">
                  <div className="icon-circle">{item.icon}</div>
                  <p>{item.title}</p>
                </div>
              ))}
            </div>
          </Carousel>
          <Button 
            className="carousel-button next" 
            icon={<RightOutlined />} 
            onClick={next}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterCarousel;