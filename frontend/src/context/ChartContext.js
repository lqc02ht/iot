import { createContext } from "react";

// const ChartContext = createContext();
const ChartContext = createContext([
  {
    temperature: [],
    humidity: [],
  }, // Dữ liệu từ DHT22
  {
    fire: [],
  }, // Dữ liệu từ cảm biến lửa
]);

export default ChartContext;
