import axios from "axios";

export const getMqttData = async (id) => {
  const res = await axios.get("http://localhost:3000/esp/" + id + "/gas");
  return res.data;
}
