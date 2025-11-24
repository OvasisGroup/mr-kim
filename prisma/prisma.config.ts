// Prisma 7 configuration for CLI commands
import type { Config } from '@prisma/client';

const config: Config = {
  datasources: {
    db: {
      url: process.env.POSTGRES_URL!,
    },
  },
};

export default config;
