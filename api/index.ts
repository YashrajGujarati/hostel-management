import dns from 'dns';
import app from '../backend/src/index';

// Force Google DNS for Vercel serverless (fixes MongoDB SRV lookup)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

export default app;
