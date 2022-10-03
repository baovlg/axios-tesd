import axios from 'axios';

export const API_URL = 'https://SECRET.mockapi.io';


const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
    request => {
        // Do something before request is sent
        return request;
    },
    error => {
        // Do something with request error
        return Promise.reject(error);
    });

axiosInstance.interceptors.request.use(
    response => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
    },
    error => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        // console.log({ error });
        let originalRequest = error.config;
        let refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            return axios
                .post(`${API_URL}/authentication/refresh`, { refreshToken: refreshToken })
                .then(res => {
                    if (res.status === 200) {
                        localStorage.setItem('accessToken', res.data.accessToken);
                        localStorage.setItem('refreshToken', res.data.refreshToken);
                        originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
                        return axios(originalRequest);
                    }
                })
                .catch(() => {
                    localStorage.clear();
                    location.reload();
                });
        }
        return Promise.reject(error.response || error.message);
    });

export default axiosInstance;