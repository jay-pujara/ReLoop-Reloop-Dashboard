import crypto from 'node:crypto';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();
const baseUri = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI;
if (!baseUri) throw new Error('MONGODB_TEST_URI is required for F2 integration tests');
const parsedUri = new URL(baseUri);
parsedUri.pathname = `/r_f2_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
process.env.MONGODB_URI = parsedUri.toString();
process.env.NODE_ENV = 'test';
process.env.MEDIA_STORAGE_PROVIDER = 'local';
process.env.MEDIA_STORAGE_ROOT = path.resolve(process.cwd(), 'uploads', 'test_listings');

void import('./f2.integration.test.js');