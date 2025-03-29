import { useState, useEffect } from "react";
import { Select } from "antd";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import api from "../../../config/axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TotalRevenue = () => {
  const [year, setYear] = useState(2024);
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`dashboard/revenue?year=${year}`);
        if (response.data.statusCode === 200) {
          const labels = response.data.data.monthlyRevenueList.map((item) => `Tháng ${item.month}`);
          const revenueData = response.data.data.monthlyRevenueList.map((item) => item.amount);
          setData({
            labels,
            datasets: [
              {
                label: "Doanh thu",
                data: revenueData,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
            ],
          });
          setTotalRevenue(response.data.data.totalRevenue);
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }
    };

    fetchData();
  }, [year]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        textAlign: "center",
      }}
    >
      <h2>Doanh thu theo năm</h2>
      <Select value={year} onChange={setYear} style={{ width: 120, marginBottom: 20 }}>
        <Select.Option value={2024}>2024</Select.Option>
        <Select.Option value={2025}>2025</Select.Option>
      </Select>
      <h3>Tổng doanh thu: {totalRevenue.toLocaleString()} VND</h3>
      <div style={{ width: "60%", height: "400px" }}>
        <Bar data={data} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>
    </div>
  );
};

export default TotalRevenue;
