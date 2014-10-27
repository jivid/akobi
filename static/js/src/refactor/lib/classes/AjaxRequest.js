class AjaxRequest {
  constructor(url) {
    this.request = {};
    request.url = url;
  }

  setMethod(method) {
    request.method = method.toLowerCase();
  }

  setSuccessHandler(callback) {
    [1, 2, 3].forEach((num) => {console.log(num)})
  }
}

module.exports = AjaxRequest
