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
    {
      gas: [],
    }, // Dữ liệu từ cảm biến khí gas
  ]);
  
export default ChartContext;