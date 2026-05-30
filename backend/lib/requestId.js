
import { v4 as uuidv4, validate as validateUuid } from 'uuid'
export function attachRequestId(req, res) {
  const clientId = req.headers['x-request-id'];
  // AUDIT #10: Validate client-supplied ID is a real UUID to prevent log injection
  const requestId = (clientId && validateUuid(clientId)) ? clientId : uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  return requestId;
}
