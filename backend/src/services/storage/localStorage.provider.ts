import fs from 'fs/promises';
import path from 'path';
import { IStorageProvider, StorageFile, StorageUploadResult } from './storage.interface.js';

export class LocalStorageProvider implements IStorageProvider {
  private readonly rootDir: string;

  constructor(rootDir?: string) {
    const configured = rootDir || process.env.MEDIA_STORAGE_ROOT || path.join(process.cwd(), 'uploads', 'listings');
    this.rootDir = path.resolve(configured);
  }

  public getRootDir(): string {
    return this.rootDir;
  }

  private resolveSafePath(key: string): string {
    // Sanitize key and defend against path traversal attacks (e.g., ../../secret)
    const normalizedKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    const resolvedPath = path.resolve(this.rootDir, normalizedKey);

    if (resolvedPath !== this.rootDir && !resolvedPath.startsWith(this.rootDir + path.sep)) {
      throw new Error('Path traversal attempt detected: target path outside storage root');
    }
    return resolvedPath;
  }

  async upload(key: string, buffer: Buffer, _contentType: string): Promise<StorageUploadResult> {
    const filePath = this.resolveSafePath(key);
    // Recursively ensure all parent directories exist
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return { storageKey: key, size: buffer.length };
  }

  async get(key: string): Promise<StorageFile> {
    const filePath = this.resolveSafePath(key);
    const buffer = await fs.readFile(filePath);
    return {
      buffer,
      contentType: 'application/octet-stream',
      size: buffer.length,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolveSafePath(key);
    try {
      await fs.rm(filePath, { force: true });
    } catch {
      // Best-effort cleanup
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.resolveSafePath(key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
