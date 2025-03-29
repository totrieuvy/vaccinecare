import { useState, useEffect } from "react";
import { Select, Card } from "antd";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import api from "../../../config/axios";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function TotalVaccine() {
  const [year, setYear] = useState(2024);
  const [data, setData] = useState(null);

  useEffect(() => {
    document.title = "Total Vaccine Dashboard";
    fetchData(year);
  }, [year]);

  const fetchData = async (selectedYear) => {
    try {
      const response = await api.get(`dashboard/summary?year=${selectedYear}`);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChangeYear = (value) => {
    setYear(value);
  };

  const ageChartData = data
    ? {
        labels: data.ageData.map((item) => `Age ${item.age}`),
        datasets: [
          {
            label: "Number Vaccinated",
            data: data.ageData.map((item) => item.numberVaccinated),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      }
    : null;

  const manufacturerChartData = data
    ? {
        labels: data.manufacturerData.map((item) => item.manufacturerShortName),
        datasets: [
          {
            label: "Number of Batches",
            data: data.manufacturerData.map((item) => item.numberBatch),
            backgroundColor: "rgba(255, 99, 132, 0.6)",
          },
        ],
      }
    : null;

  const vaccineChartData = data
    ? {
        labels: data.vaccineData.map((item) => item.listVaccine.map((v) => v.vaccineName).join(", ")),
        datasets: [
          {
            label: "Number Vaccinated",
            data: data.vaccineData.map((item) => item.numberVaccinated),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
        ],
      }
    : null;

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Total Vaccine Dashboard</h2>
      <Select value={year} onChange={handleChangeYear} style={{ width: 120 }}>
        <Select.Option value={2024}>2024</Select.Option>
        <Select.Option value={2025}>2025</Select.Option>
      </Select>

      {data && (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "20px 0" }}>
            <Card style={{ width: 300, textAlign: "center" }}>
              <h3 style={{ color: "red" }}>Total Available Vaccines</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>{data.totalAvailableVaccines}</p>
            </Card>
            <Card style={{ width: 300, textAlign: "center" }}>
              <h3 style={{ color: "red" }}>Total Vaccinated Customers</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>{data.totalVaccinatedCustomers}</p>
            </Card>
            <Card style={{ width: 300, textAlign: "center" }}>
              <h3 style={{ color: "red" }}>Total Available Packages</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>{data.totalAvailablePackages}</p>
            </Card>
          </div>

          <h3>Age Group Vaccination</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "600px",
              margin: "0 auto",
              marginBottom: "40px",
            }}
          >
            <Bar data={ageChartData} />
          </div>

          <h3>Vaccine Manufacturer Data</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "600px",
              margin: "0 auto",
              marginBottom: "40px",
            }}
          >
            <Bar data={manufacturerChartData} />
          </div>

          <h3>Most Used Vaccines</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "600px",
              margin: "0 auto",
              marginBottom: "40px",
            }}
          >
            <Bar data={vaccineChartData} />
          </div>
        </>
      )}
    </div>
  );
}

export default TotalVaccine;
