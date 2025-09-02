import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  console.log("Healthcheck initiated - healthy");
  return res.status(200).send("OK");
}
