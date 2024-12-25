import React, { useState, useEffect } from "react";
import { Paper, Box, Tab, Button, Typography, Grid, Alert } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import RealtimeChart from "./components/Information";
import ChartContext from "./context/ChartContext";
import { getMqttData } from "./api/mqttAPI";

// Hàm để mở ứng dụng gọi điện thoại
const makeCall = () => {
  window.location.href = "tel:0854036688"; // Thay số điện thoại với số cần gọi
};

function App() {
  const [value, setValue] = useState("1");
  const [fireAlert, setFireAlert] = useState(false); // Trạng thái cảnh báo cháy

  // Dữ liệu biểu đồ
  const [chartData_1, setChartData_1] = useState({
    datasets: [
      {
        label: "Fire Sensor",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
        fill: false,
        data: [],
        pointStyle: "rect",
        pointRadius: 4,
        pointHoverRadius: 5,
        tension: 0,
      },
    ],
  });

  const [chartData_2, setChartData_2] = useState({
    datasets: [
      {
        label: "Temperature Sensor",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        fill: false,
        data: [],
        cubicInterpolationMode: "monotone",
        yAxisID: "y0",
      },
    ],
  });

  useEffect(() => {
    // Function to fetch and update chart data
    const fetchData = () => {
      getMqttData()
        .then((data) => {
          if (!data || data.length === 0) {
            console.warn("No data received from MQTT.");
            return;
          }
          console.log(data);
          // Assuming data is an array and picking the latest entry for simplicity
          const latestData = data[0];
          const timestamp = latestData.createdAt;
          // Check for fire alert
          console.log("fire analog: ", latestData.fire_analog);
          if (latestData.fire_analog < 200) {
            setFireAlert(true);
          } else if (latestData.fire_analog >= 200) {
            setFireAlert(false);
          }

          // Function to update a specific chart data state
          const updateChartData = (setChartData) => {
            setChartData((prevState) => ({
              ...prevState,
              datasets: prevState.datasets.map((dataset) => {
                let newY;
                if (dataset.label === "Fire Sensor") {
                  newY = latestData.fire_analog;
                } else if (dataset.label === "Temperature Sensor") {
                  newY = latestData.temperature;
                }
                return {
                  ...dataset,
                  data: [...dataset.data, { x: timestamp, y: newY }], // Thêm dữ liệu vào cuối mảng
                };
              }),
            }));
          };

          updateChartData(setChartData_1);
          updateChartData(setChartData_2);
        })
        .catch((err) => console.error("Error fetching MQTT data:", err));
    };

    // Set interval for data fetching
    const intervalId = setInterval(fetchData, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <ChartContext.Provider value={[chartData_1, chartData_2]}>
      <div className="App">
        <header className="App-header">
          <Paper
            sx={{
              minWidth: "100%",
              flexGrow: 1,
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
            }}
          >
            <TabContext value={value}>
              {/* Nút gọi điện */}
              {/* <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={makeCall}
                  disabled={!fireAlert} // Nút chỉ kích hoạt khi cảnh báo cháy
                >
                  Call Firefighters
                </Button>
              </Box> */}
              {fireAlert && (
                <Alert
                  severity="error"
                  sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}
                >
                  🚨 Cảnh báo cháy! 🚨
                </Alert>
              )}

              <RealtimeChart />
            </TabContext>
          </Paper>
        </header>
      </div>
    </ChartContext.Provider>
  );
}

export default App;