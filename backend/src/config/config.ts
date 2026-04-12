import { join } from 'path';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    type: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.POSTGRES_HOST || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'mis_user',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB || 'mis_clinic',
    entities: [join(__dirname, '/../**/*.entity.{js,ts}')],
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    logging: process.env.NODE_ENV === 'development',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
});
