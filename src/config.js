import dotenv from 'dotenv';

dotenv.config();

const config = {
    PORT: process.env.PORT || 5000,
    MONGODB_URL: process.env.BBDD_URL || 'mongodb://127.0.0.1:27017/rolling_90i2',
    SERVER: 'local',
    SECRET: process.env.SECRET
};

export default config;
