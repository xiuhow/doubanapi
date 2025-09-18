const DoubanAPI = require('../../api-server.js');

const apiServer = new DoubanAPI();

// Netlify函数处理器
exports.handler = async (event, context) => {
  // 模拟Express请求对象
  const req = {
    method: event.httpMethod,
    path: event.path,
    query: event.queryStringParameters || {},
    headers: event.headers || {},
    body: event.body ? JSON.parse(event.body) : {}
  };

  // 模拟Express响应对象
  const res = {
    statusCode: 200,
    headers: {},
    body: '',

    status: function(code) {
      this.statusCode = code;
      return this;
    },

    json: function(data) {
      this.body = JSON.stringify(data);
      this.headers['Content-Type'] = 'application/json';
      return this;
    },

    setHeader: function(name, value) {
      this.headers[name] = value;
    }
  };

  try {
    // 处理请求
    await apiServer.app._router.handle(req, res, () => {});

    return {
      statusCode: res.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        ...res.headers
      },
      body: res.body
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      })
    };
  }
};