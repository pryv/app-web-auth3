/**
 * App Web auth 3 can be built in two flavors to discover serviceInfoUrl
 * 1. DNSLess = false : look for https://reg.{domain of the web page}/service/info
 * 2. DNSLess = true : look for http(s)://{hostname}/reg/service/info
 */
module.exports = { DNSLess: false };
