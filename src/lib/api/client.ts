import axios from "axios";
import {BACKEND_API_URL} from "../constant.ts";

export const client = axios.create({
    baseURL: BACKEND_API_URL,
    timeout: 10000, // Set a timeout for requests
    headers: {
        "Content-Type": "application/json",
    },
});

// // Add a request interceptor
// client.interceptors.request.use(
//     (error) => {
//         // Handle request error
//         return Promise.reject(error);
//     }
// );
//
// // Add a response interceptor
// client.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         return Promise.reject(error);
//     }
// );


