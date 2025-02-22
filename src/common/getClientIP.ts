import { Ipware } from "@fullerstack/nax-ipware"

export function getClientIP(req: Request) {
  const ipware = new Ipware()

  return ipware.getClientIP(req)
}
