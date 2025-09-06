import axios from "axios";
import Cookie from 'js-cookie';
const baseURL = process.env.NODE_ENV === 'development' ? '/api1' : 'http://localhost:3000'
const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'foobar',
    'token': Cookie.get('token')
  }
});
// 添加响应拦截器
instance.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 对响应错误做点什么
  //接收到响应数据并成功后的一些共有的处理，关闭loading等

  return response
}, error => {
  /***** 接收到异常响应的处理开始 *****/
  if (error && error.response) {
    // 1.公共错误处理
    // 2.根据响应码具体处理
    switch (error.response.status) {
      case 400:
        error.message = 'Bad request'
        break;
      case 401:
        error.message = 'Unauthorized, please log in again'
        break;
      case 403:
        error.message = 'Access denied'
        break;
      case 404:
        error.message = 'Request error, resource not found'
        window.location.href = "/NotFound"
        break;
      case 405:
        error.message = 'Request method not allowed'
        break;
      case 408:
        error.message = 'Request timeout'
        break;
      case 500:
        error.message = 'Server error'
        break;
      case 501:
        error.message = 'Network not available'
        break;
      case 502:
        error.message = 'Network error'
        break;
      case 503:
        error.message = 'Service unavailable'
        break;
      case 504:
        error.message = 'Network timeout'
        break;
      case 505:
        error.message = 'HTTP version does not support this request'
        break;
      default:
        error.message = `Connection error ${error.response.status}`
    }
  } else {
    // Timeout handling
    if (JSON.stringify(error).includes('timeout')) {
      Message.error('Server response timeout, please refresh the current page')
    }
    error.message = 'Failed to connect to the server'
  }

  Message.error(error.message)
  /***** 处理结束 *****/
  //如果不需要错误处理，以上的处理过程都可省略

  return Promise.reject(error);
});
export default instance