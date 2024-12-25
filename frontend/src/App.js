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
      { label: "Fire Sensor", backgroundColor: "rgba(255, 99, 132, 0.5)", borderColor: "rgb(255, 99, 132)", fill: false, data: [], pointStyle: "rect", pointRadius: 4, pointHoverRadius: 5, tension: 0 },
      { label: "Temperature Sensor", backgroundColor: "rgba(54, 162, 235, 0.5)", borderColor: "rgb(54, 162, 235)", fill: false, data: [], cubicInterpolationMode: "monotone", yAxisID: "y1" },
      { label: "Gas Sensor", backgroundColor: "rgba(75, 192, 192, 0.5)", borderColor: "rgb(75, 192, 192)", fill: false, data: [], cubicInterpolationMode: "monotone", yAxisID: "y2" }
    ]
  });

  const [chartData_2, setChartData_2] = useState({
    datasets: [
      { label: "Fire Sensor", backgroundColor: "rgba(255, 99, 132, 0.5)", borderColor: "rgb(255, 99, 132)", fill: false, data: [], pointStyle: "rect", pointRadius: 4, pointHoverRadius: 5, tension: 0 },
      { label: "Temperature Sensor", backgroundColor: "rgba(54, 162, 235, 0.5)", borderColor: "rgb(54, 162, 235)", fill: false, data: [], cubicInterpolationMode: "monotone", yAxisID: "y1" },
      { label: "Gas Sensor", backgroundColor: "rgba(75, 192, 192, 0.5)", borderColor: "rgb(75, 192, 192)", fill: false, data: [], cubicInterpolationMode: "monotone", yAxisID: "y2" }
    ]
  });

  const [chartData_3, setChartData_3] = useState({
    datasets: [
      { label: "Fire Sensor", backgroundColor: "rgba(255, 99, 132, 0.5)", borderColor: "rgb(255, 99, 132)", fill: false, data: [], pointStyle: "rect", pointRadius: 4, pointHoverRadius: 5, tension: 0 },
      { label: "Temperature Sensor", backgroundColor: "rgba(54, 162, 235, 0.5)", borderColor: "rgb(54, 162, 235)", fill: false, data: [], cubicInterpolationMode: "monotone", yAxisID: "y1" },
      { label: "Gas Sensor", backgroundColor: "rgba(75, 192, 192, 0.5)", borderColor: "rgb(75, 192, 192)", fill: false, data: [], cubicInterpolationMode: "monotone", yAxisID: "y2" }
    ]
  });

  useEffect(() => {
    // Fetch dữ liệu từ MQTT cho từng căn hộ
    const fetchData = (apartmentId, setChartData) => {
      getMqttData(apartmentId).then((data) => {
        // Kiểm tra có sự kiện cháy không
        if (data[0]["fire sensor"] > 80) {
          setFireAlert(true); // Cảnh báo cháy nếu chỉ số vượt quá 80
        }
        setChartData((prevState) => ({
          datasets: prevState.datasets.map((dataset, index) => ({
            ...dataset,
            data: [
              ...dataset.data,
              { x: data[0].createdAt, y: data[0][dataset.label.toLowerCase().replace(" ", "_")] }
            ]
          }))
        }));
      }).catch((err) => console.log(err));
    };

    // Interval để cập nhật dữ liệu cho mỗi căn hộ
    const intervalIds = ["1", "2", "3"].map((apartmentId) =>
      setInterval(() => fetchData(apartmentId, apartmentId === "1" ? setChartData_1 : apartmentId === "2" ? setChartData_2 : setChartData_3), 2000)
    );

    // Cleanup
    return () => intervalIds.forEach(clearInterval);
  }, []);
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <ChartContext.Provider value={[chartData_1, chartData_2, chartData_3]}>
      <div className="App">
        <header className="App-header">
          <Paper sx={{ minWidth: "100%", flexGrow: 1, backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1A2027" : "#fff" }}>
            <TabContext value={value}>
              {/* Nút gọi điện */}
              <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={makeCall}
                  // disabled={!fireAlert} // Nút chỉ kích hoạt khi cảnh báo cháy
                >
                  Call Firefighters
                </Button>
              </Box>
                <RealtimeChart />
            </TabContext>
          </Paper>
        </header>
      </div>
    </ChartContext.Provider>
  );
}

export default App;