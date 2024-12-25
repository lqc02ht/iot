import { Grid, Paper, Alert, Typography } from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-streaming";
import ChartContext from "../context/ChartContext";

function RealtimeChart() {
  const [chartData_1, chartData_2, chartData_3] = useContext(ChartContext);

  // const options_1 = {
  //   scales: {
  //     xAxes: [
  //       {
  //         type: "realtime",
  //         realtime: {
  //           delay: 10000,
  //           duration: 50000,
  //           refresh: 1000,
  //           // onRefresh: (chart) => {
  //           //   chart.chart.data.datasets
  //           // },
  //         },
  //       },
  //     ],
  //     yAxes: [
  //       {
  //         id: 'y0',
  //         type: 'linear',
  //         position: 'left',
  //         ticks: {
  //           beginAtZero: true,
  //           max: 1000,
  //         },
  //       },
  //       {
  //         id: 'y1',
  //         type: 'linear',
  //         position: 'right',
  //         ticks: {
  //           beginAtZero: true,
  //           max: 10000,
  //         },
  //       },
  //     ],
  //   },
  //   plugins: {
  //     streaming: {
  //       frameRate: 30,
  //     },
  //     title: {
  //       display: true,
  //       text: "Fire Sensor",
  //     }
  //   },
  // };
  const optionsFire = {
    scales: {
      xAxes: [
        {
          type: "realtime",
          realtime: {
            delay: 5000,
            duration: 30000,
            refresh: 1000,
          },
        },
      ],
      yAxes: [
        {
          id: "y0",
          type: "linear",
          ticks: {
            beginAtZero: true,
            max: 1000, // Giới hạn cảm biến lửa
          },
        },
      ],
    },
    plugins: {
      title: {
        display: true,
        text: "Fire Sensor",
      },
    },
  };  
  // const options_2 = {
  //   scales: {
  //     xAxes: [
  //       {
  //         type: "realtime",
  //         realtime: {
  //           delay: 10000,
  //           duration: 50000,
  //           refresh: 1000,
  //           // onRefresh: (chart) => {
              
  //           // },
  //         },
  //       },
  //     ],
  //     yAxes: [
  //       {
  //         id: 'y0',
  //         type: 'linear',
  //         position: 'left',
  //         ticks: {
  //           beginAtZero: true,
  //           max: 1000,
  //         },
  //       },
  //       {
  //         id: 'y1',
  //         type: 'linear',
  //         position: 'right',
  //         ticks: {
  //           beginAtZero: true,
  //           max: 10000,
  //         },
  //       },
  //     ],
  //   },
  //   plugins: {
  //     streaming: {
  //       frameRate: 30,
  //     },
  //     title: {
  //       display: true,
  //       text: "Temperature Sensor",
  //     }
  //   },
  // };
  const optionsTempHumidity = {
    scales: {
      xAxes: [
        {
          type: "realtime",
          realtime: {
            delay: 5000,
            duration: 30000,
            refresh: 1000,
          },
        },
      ],
      yAxes: [
        {
          id: "y0",
          type: "linear",
          position: "left",
          ticks: {
            beginAtZero: true,
            max: 50, // Giới hạn nhiệt độ
          },
        },
        {
          id: "y1",
          type: "linear",
          position: "right",
          ticks: {
            beginAtZero: true,
            max: 100, // Giới hạn độ ẩm
          },
        },
      ],
    },
    plugins: {
      title: {
        display: true,
        text: "Temperature Sensor",
      },
    },
  };  
  const optionsGas = {
    scales: {
      xAxes: [
        {
          type: "realtime",
          realtime: {
            delay: 10000,
            duration: 50000,
            refresh: 1000,
            // onRefresh: (chart) => {
             
            // },
          },
        },
      ],
      yAxes: [
        {
          id: 'y0',
          type: 'linear',
          position: 'left',
          ticks: {
            beginAtZero: true,
            max: 1000,
          },
        },
        {
          id: 'y1',
          type: 'linear',
          position: 'right',
          ticks: {
            beginAtZero: true,
            max: 10000,
          },
        },
      ],
    },
    plugins: {
      title: {
        display: true,
        text: "Gas Sensor",
      },
      streaming: {
        frameRate: 30,
      }
    },
  };

  return (
    <div style={{ width: "100%", margin: "0 auto", height: "100%" }}>
      <Alert
        style={{ marginBottom: "10px", fontWeight: "bold" }}
        severity="info"
      >
        It's beta, don't expect too much!
      </Alert>
      <Paper
        sx={{
          p: 1,
          marginBottom: "10px",
          maxWidth: "100%",
          flexGrow: 1,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#1A2027" : "#fff",
        }}
      >
        <Typography
          sx={{ fontSize: 20, fontWeight: 1000 }}
          color="text.first"
          gutterBottom
        >
          Fire Sensor
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Line data={chartData_1} options={optionsFire} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Line data={chartData_2} options={optionsTempHumidity} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Line data={chartData_3} options={optionsGas} />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

export default RealtimeChart;