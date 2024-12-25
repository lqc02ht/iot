import axios from "axios";

export const getMqttData = async () => {
  const res = await axios.get("http://localhost:3000/random1");
  return res.data;
};
