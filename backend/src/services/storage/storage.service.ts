import { IStorageProvider } from './storage.interface.js';
import { LocalStorageProvider } from './localStorage.provider.js';

class StorageService {
  private provider: IStorageProvider;

  constructor() {
    const providerType = process.env.MEDIA_STORAGE_PROVIDER || 'local';
    if (providerType === 'local') {
      this.provider = new LocalStorageProvider();
    } else {
      // Future cloud object storage provider (e.g. S3 / GCS)
      this.provider = new LocalStorageProvider();
    }
  }

  public getProvider(): IStorageProvider {
    return this.provider;
  }

  public setProvider(provider: IStorageProvider): void {
    this.provider = provider;
  }
}

export const storageService = new StorageService();
export const storageProvider = storageService.getProvider();
