import axios from "axios";

const API_URL = "http://localhost:3000/api";


export const getMessagesByRide = async (rideId: number) => {
  return axios.get(`${API_URL}/chat/ride/${rideId}`);
}
export const createChat = async (data: any) => {
  return axios.post(`${API_URL}/chat`, data);
};
export const createMessage = async (data: any) => {
  return axios.post(`${API_URL}/message`, data);
};
export const getMessages = async () => {
  return axios.get(`${API_URL}/message`);
}
export const getRides = async () => {
  return axios.get(`${API_URL}/ride`);
}
export const getRideById = async (id: number) => {
  return axios.get(`${API_URL}/ride/${id}`);
}
export const getRideByDriverId = async (id: number) => {
  return axios.get(`${API_URL}/ride/driver/${id}`);
}
