import "./App.css";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import * as React from "react";
import TabPanel from "@mui/lab/TabPanel";
import { Paper } from "@mui/material";
import Information from "./components/Information";
import { getMqttData } from "./api/mqttAPI";
import ChartContext from "./context/ChartContext";

function App() {
  const [value, setValue] = React.useState("1");

  const [chartData_1, setChartData_1] = React.useState({
    datasets: [
      {
        label: "Analog",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        fill: false,
        data: [],
        pointStyle: "rect",
        pointRadius: 4,
        pointHoverRadius: 5,
        tension: 0,
        yAxisID: "y0",
      },
      {
        label: "CH4",
        backgroundColor: "rgba(250, 128, 114, 0.5)",
        borderColor: "rgb(250, 128, 114)",
        fill: false,
        data: [],
        cubicInterpolationMode: "monotone",
        yAxisID: "y1",
      },
    ],
  });

  const [chartData_2, setChartData_2] = React.useState({
    datasets: [
      {
        label: "Analog",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        fill: false,
        data: [],
        pointStyle: "rect",
        pointRadius: 4,
        pointHoverRadius: 5,
        tension: 0,
        yAxisID: "y0",
      },
      {
        label: "CH4",
        backgroundColor: "rgba(250, 128, 114, 0.5)",
        borderColor: "rgb(250, 128, 114)",
        fill: false,
        data: [],
        cubicInterpolationMode: "monotone",
        yAxisID: "y1",
      },
    ],
  });

  const [chartData_3, setChartData_3] = React.useState({
    datasets: [
      {
        label: "Analog",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        fill: false,
        data: [],
        pointStyle: "rect",
        pointRadius: 4,
        pointHoverRadius: 5,
        tension: 0,
        yAxisID: "y0",
      },
      {
        label: "CH4",
        backgroundColor: "rgba(250, 128, 114, 0.5)",
        borderColor: "rgb(250, 128, 114)",
        fill: false,
        data: [],
        cubicInterpolationMode: "monotone",
        yAxisID: "y1",
      },
    ],
  });

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      getMqttData("1")
        .then((data) => {
          // console.log(data);
          setChartData_1((prevState) => ({
            ...prevState,
            datasets: [
              {
                ...prevState.datasets[0],
                data: [
                  ...prevState.datasets[0].data,
                  {
                    x: data[0].createdAt,
                    y: data[0].gas,
                  },
                ],
              },
              {
                ...prevState.datasets[1],
                data: [
                  ...prevState.datasets[1].data,
                  {
                    x: data[0].createdAt,
                    y: data[0].ch4,
                  },
                ],
              },
            ],
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    }, 2000);
    return () => clearInterval(intervalId); //This is important
  }, [chartData_1]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      getMqttData("2")
        .then((data) => {
          // console.log(data);
          setChartData_2((prevState) => ({
            ...prevState,
            datasets: [
              {
                ...prevState.datasets[0],
                data: [
                  ...prevState.datasets[0].data,
                  {
                    x: data[0].createdAt,
                    y: data[0].gas,
                  },
                ],
              },
              {
                ...prevState.datasets[1],
                data: [
                  ...prevState.datasets[1].data,
                  {
                    x: data[0].createdAt,
                    y: data[0].ch4,
                  },
                ],
              },
            ],
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    }, 2000);
    return () => clearInterval(intervalId); //This is important
  }, [chartData_2]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      getMqttData("3")
        .then((data) => {
          // console.log(data);
          setChartData_3((prevState) => ({
            ...prevState,
            datasets: [
              {
                ...prevState.datasets[0],
                data: [
                  ...prevState.datasets[0].data,
                  {
                    x: data[0].createdAt,
                    y: data[0].gas,
                  },
                ],
              },
              {
                ...prevState.datasets[1],
                data: [
                  ...prevState.datasets[1].data,
                  {
                    x: data[0].createdAt,
                    y: data[0].ch4,
                  },
                ],
              },
            ],
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    }, 2000);
    return () => clearInterval(intervalId); //This is important
  }, [chartData_3]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <ChartContext.Provider value={[chartData_1, chartData_2, chartData_3]}>
      <div className="App">
        <header className="App-header">
          <Paper
            sx={{
              // p: 2,
              minWidth: "100%",
              flexGrow: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#1A2027" : "#fff",
            }}
          >
            <TabContext
              value={value}
              sx={
                {
                  // minWidth: '100%'
                }
              }
            >
              <Box sx={{ borderBottom: 0, borderColor: "divider" }}>
                <TabList
                  onChange={handleChange}
                  aria-label="lab API tabs example"
                  centered
                >
                  {/* <Tab
                    sx={{ fontWeight: "Bold" }}
                    label="Controller"
                    value="1"
                  /> */}
                  <Tab
                    sx={{ fontWeight: "Bold" }}
                    label="Information"
                    value="1"
                  />
                </TabList>
              </Box>
              <TabPanel value="2">{/* <DevicesControl /> */}</TabPanel>
              <TabPanel value="1">
                <Information />
              </TabPanel>
            </TabContext>
          </Paper>
        </header>
      </div>
    </ChartContext.Provider>
  );
}
export default App;
