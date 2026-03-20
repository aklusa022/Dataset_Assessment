import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    productionBrowserSourceMaps: false,
    compress: true,
    poweredByHeader: false,
    experimental: {

        // Enable parallel builds
        webpackBuildWorker: true,
    }

};

export default nextConfig;
