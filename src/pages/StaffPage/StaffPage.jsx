import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./StaffPage.scss";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/userSlice";
import { useNavigate } from "react-router-dom";

function StaffPage() {
  const [schedule, setSchedule] = useState([]);
  const [vaccines, setVaccines] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    document.title = "Staff";

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch schedule
      const scheduleResponse = await api.get("schedule");
      // Fetch vaccines
      const vaccineResponse = await api.get("v1/vaccine?pageIndex=1&pageSize=1000");

      // Create vaccine lookup map
      const vaccineMap = {};
      vaccineResponse.data.data.forEach((vaccine) => {
        vaccineMap[vaccine.vaccineId] = vaccine.vaccineName;
      });
      setVaccines(vaccineMap);

      if (scheduleResponse.data && scheduleResponse.data.data) {
        const sortedData = scheduleResponse.data.data.sort((a, b) => {
          return (
            new Date(b.scheduleDate.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")) -
            new Date(a.scheduleDate.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"))
          );
        });
        setSchedule(sortedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async (scheduleId) => {
    if (window.confirm("Are you sure you want to confirm this check-in?")) {
      setLoading(true);
      try {
        await api.put(`schedule/check-in/${scheduleId}`);
        fetchData();
      } catch (error) {
        console.error("Error confirming check-in:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const filteredSchedule = schedule.filter((item) =>
    item.childrenName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isButtonDisabled = (status) => {
    return status.toLowerCase() !== "upcoming";
  };

  const shouldShowButton = (status) => {
    return status.toLowerCase() === "upcoming";
  };

  return (
    <div className="staff-page">
      <div className="container">
        <div className="header">
          <h1>Vaccination Schedule</h1>
          <button className="logout-button" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by child name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="search-icon">
              <svg viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Vaccine</th>
                <th>Schedule Date</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((item, index) => (
                <tr key={index}>
                  <td className="child-name">{item.childrenName}</td>
                  <td>{vaccines[item.vaccineId] || "Unknown Vaccine"}</td>
                  <td>{item.scheduleDate}</td>
                  <td>
                    <span className={`status-badge ${item.scheduleStatus.toLowerCase()}`}>{item.scheduleStatus}</span>
                  </td>
                  <td>{item.phoneNumber}</td>
                  <td>
                    {shouldShowButton(item.scheduleStatus) ? (
                      <button onClick={() => handleConfirmCheckIn(item.scheduleId)} className="confirm-button">
                        Confirm Check-in
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSchedule.length === 0 && !loading && (
          <div className="no-results">
            <div className="no-results-icon">
              <svg viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </div>
            <h3>No records found</h3>
            <p>Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffPage;
