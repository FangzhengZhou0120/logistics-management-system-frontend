import { message } from 'antd';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 定义接口，用于 HttpClient 请求方法的返回值和请求参数
interface HttpResponse<T> {
  data: T;
  status: number;
  message?: string;
}

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000, // 超时时间设置为10秒
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    // this.axiosInstance.interceptors.request.use(
    //   (config: AxiosRequestConfig) => {
    //     // 例如可以在请求头中添加 Authorization token
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //       config.headers!.Authorization = `Bearer ${token}`;
    //     }
    //     return config;
    //   },
    //   (error) => {
    //     return Promise.reject(error);
    //   }
    // );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        //message.error('request error: ' + error.message);
        // 统一处理错误
        if (error.response) {
          const { status, data } = error.response;
          if (status === 401) {
            console.error('unable to authenticate');
          } else if (status === 404) {
            console.error('Not Found');
          } else if (status === 500) {
            console.error('Server Error');
            message.error('request error: ' + JSON.parse(data).message);
          } else {
            console.error(data.message || 'request error');
          }
        } else if (error.request) {
          console.error('request error' + error.message);
        } else {
          console.error('request config error' + error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // GET 请求
  public async get<T>(url: string, params?: object): Promise<HttpResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url, {
        params,
      });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  // POST 请求
  public async post<T>(url: string, data?: object): Promise<HttpResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(url, data);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  // PUT 请求
  public async put<T>(url: string, data?: object): Promise<HttpResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(url, data);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  // DELETE 请求
  public async delete<T>(url: string): Promise<HttpResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(url);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      return Promise.reject(error);
    }
  }
}

const httpClient = new HttpClient('http://localhost:7001/api')
export default httpClient;
