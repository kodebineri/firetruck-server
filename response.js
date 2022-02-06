function ApiResponse(success, data, message) {
  this.success = success
  this.data = data
  this.message = message
  return this
}

module.exports = ApiResponse