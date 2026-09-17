import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
};
module.exports = {
  allowedDevOrigins: ["10.236.48.*",'192.168.*.*', 'localhost'],
}
export default nextConfig;
