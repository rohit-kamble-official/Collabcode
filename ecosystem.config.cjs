module.exports = {
  apps: [
    {
      name: "collabcode",
      script: "server.js",
      cwd: "/var/www/collabcode/Backend",
      instances: "max",          // Use all CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Logging
      log_file: "/var/log/collabcode/combined.log",
      out_file: "/var/log/collabcode/out.log",
      error_file: "/var/log/collabcode/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      // Auto restart
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
