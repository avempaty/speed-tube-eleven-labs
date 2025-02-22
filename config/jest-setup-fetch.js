const { fetch, Headers, Request, Response } = require("cross-fetch")
global.fetch = fetch
global.Request = Request
global.Response = Response
