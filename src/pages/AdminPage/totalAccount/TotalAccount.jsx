import { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import api from "../../../config/axios";

Chart.register(ArcElement, Tooltip, Legend);

const { Option } = Select;

const TotalAccount = () => {
  const [year, setYear] = useState(2024);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Statistic Account";
    fetchData(year);
  }, [year]);

  const fetchData = async (selectedYear) => {
    setLoading(true);
    try {
      const response = await api.get(`dashboard/account?year=${selectedYear}`);
      if (response.data.statusCode === 200) {
        setData(response.data.data.accountDictionary);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleYearChange = (value) => {
    setYear(value);
  };

  const pieData = data
    ? {
        labels: ["Admin", "Manager", "Staff", "User Account"],
        datasets: [
          {
            data: [
              (data.adminWorking || 0) + (data.adminResigned || 0),
              (data.managerWorking || 0) + (data.managerResigned || 0),
              (data.staffWorking || 0) + (data.staffResigned || 0),
              data.userAccount || 0,
            ],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
            hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
          },
        ],
      }
    : null;

  const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const index = tooltipItem.dataIndex;
            let label = tooltipItem.label;
            let value = tooltipItem.raw;

            // Ensure the value is not undefined
            if (value === undefined) {
              value = 0;
            }

            if (data) {
              if (index === 0) {
                label = `Admin: ${value} (Working: ${data.adminWorking || 0}, Resigned: ${data.adminResigned || 0})`;
              } else if (index === 1) {
                label = `Manager: ${value} (Working: ${data.managerWorking || 0}, Resigned: ${
                  data.managerResigned || 0
                })`;
              } else if (index === 2) {
                label = `Staff: ${value} (Working: ${data.staffWorking || 0}, Resigned: ${data.staffResigned || 0})`;
              } else if (index === 3) {
                label = `User Account: ${value}`;
              }
            }

            return label;
          },
        },
      },
    },
  };

  return (
    <div className="TotalAccount">
      <h2 style={{ textAlign: "center" }}>Total Account Statistics</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <Select defaultValue={year} onChange={handleYearChange} style={{ width: 120 }}>
          <Option value={2024}>2024</Option>
          <Option value={2025}>2025</Option>
        </Select>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        {loading ? (
          <Spin size="large" />
        ) : data ? (
          <div style={{ width: 400, height: 400 }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default TotalAccount;
