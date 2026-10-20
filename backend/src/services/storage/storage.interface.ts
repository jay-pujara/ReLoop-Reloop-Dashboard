export interface StorageFile {
  buffer: Buffer;
  contentType: string;
  size: number;
}

export interface StorageUploadResult {
  storageKey: string;
  size: number;
}

export interface IStorageProvider {
  upload(key: string, buffer: Buffer, contentType: string): Promise<StorageUploadResult>;
  get(key: string): Promise<StorageFile>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
