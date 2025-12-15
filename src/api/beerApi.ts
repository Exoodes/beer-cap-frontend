import axios from "axios";
import type { BeerCap } from "../types";

const API_URL = "http://localhost:8000"; // Your FastAPI URL

export const fetchCaps = async (): Promise<BeerCap[]> => {
  const response = await axios.get(`${API_URL}/beer_caps/`);
  return response.data;
};
