import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Metadata (title, description, canonical, Open Graph) must be in <head> in the
  // first bytes for every client. Without this, it streams into a hidden block
  // in <body>, which search engines and audits may not read as page metadata.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
