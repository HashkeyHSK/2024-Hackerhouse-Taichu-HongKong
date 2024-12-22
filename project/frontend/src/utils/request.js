import axios from 'axios';
import humps from 'humps';

// 创建一个 axios 实例
const http = axios.create({
  baseURL: 'http://43.154.186.250:5000/api', // 设置你的 API 基础 URL
  timeout: 30000, // 请求超时时间
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 在请求发送之前做些什么，比如添加 token
    const token = localStorage.getItem('token'); // 假设你将 token 存储在 localStorage 中
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const camelCasedData = humps.camelizeKeys(response.data); // 转换为驼峰命名
    return camelCasedData; // 直接返回转换后的数据部分
  },
  (error) => {
    // 对响应错误做点什么
    if (error.response) {
      // 请求已发出，服务器响应了状态码
      console.error('Error Response:', error.response);
    } else {
      // 其他错误
      console.error('Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

// 封装 GET 请求
const getRequest = (url, params = {}) => {
  return http.get(url, { params });
};

// 封装 POST 请求
const postRequest = (url, data = {}) => {
  return http.post(url, data);
};

// 封装 PUT 请求
const putRequest = (url, data = {}) => {
  return http.put(url, data);
};

// 封装 DELETE 请求
const delRequest = (url) => {
  return http.delete(url);
};

// 导出封装的方法
export {
  getRequest,
  postRequest,
  putRequest,
  delRequest,
};