import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  ContainerClient,
  BlockBlobClient,
} from '@azure/storage-blob';

/**
 * Global cache for BlobServiceClient in serverless / HMR environments.
 */
declare global {
  // eslint-disable-next-line no-var
  var __blobServiceClient: BlobServiceClient | undefined;
}

/**
 * Retrieves Azure Storage configuration from environment variables.
 */
function getAzureStorageConfig() {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || '';
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || '';
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'perk-assets';
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
  const defaultExpiryMinutes = Number(process.env.AZURE_STORAGE_SAS_EXPIRY_MINUTES) || 15;

  return {
    accountName,
    accountKey,
    containerName,
    connectionString,
    defaultExpiryMinutes,
  };
}

/**
 * Returns a configured BlobServiceClient singleton.
 */
export function getBlobServiceClient(): BlobServiceClient {
  if (globalThis.__blobServiceClient) {
    return globalThis.__blobServiceClient;
  }

  const { connectionString, accountName, accountKey } = getAzureStorageConfig();

  let client: BlobServiceClient;

  if (connectionString) {
    client = BlobServiceClient.fromConnectionString(connectionString);
  } else if (accountName && accountKey) {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const url = `https://${accountName}.blob.core.windows.net`;
    client = new BlobServiceClient(url, sharedKeyCredential);
  } else {
    // Fallback: Local emulator or mock client placeholder
    const fallbackUrl = `https://${accountName || 'devstoreaccount1'}.blob.core.windows.net`;
    client = new BlobServiceClient(fallbackUrl);
    console.warn(
      '[AzureStorage] Warning: AZURE_STORAGE_ACCOUNT_KEY or AZURE_STORAGE_CONNECTION_STRING is not set. SAS generation will require valid credentials in production.'
    );
  }

  globalThis.__blobServiceClient = client;
  return client;
}

/**
 * Returns a ContainerClient for the designated perks container.
 */
export function getContainerClient(containerNameOverride?: string): ContainerClient {
  const { containerName } = getAzureStorageConfig();
  const serviceClient = getBlobServiceClient();
  return serviceClient.getContainerClient(containerNameOverride || containerName);
}

/**
 * Returns a BlockBlobClient for a specific storage file path.
 */
export function getBlockBlobClient(
  storageFilePath: string,
  containerNameOverride?: string
): BlockBlobClient {
  const containerClient = getContainerClient(containerNameOverride);
  // Normalize leading slashes
  const cleanPath = storageFilePath.replace(/^\/+/, '');
  return containerClient.getBlockBlobClient(cleanPath);
}

export interface GenerateSASOptions {
  expiresInMinutes?: number;
  contentDisposition?: string;
  containerName?: string;
}

/**
 * Generates a time-limited, read-only Shared Access Signature (SAS) URL for a perk asset.
 *
 * @param storageFilePath The blob path inside the container (e.g., 'assets/guides/alpha-access-guide.pdf')
 * @param options Optional configuration including expiry (default: 15 minutes) and Content-Disposition headers.
 * @returns Complete HTTPS SAS URL ready for secure client download or 302 redirect.
 */
export async function generatePerkSasUrl(
  storageFilePath: string,
  options: GenerateSASOptions = {}
): Promise<string> {
  const { accountName, accountKey, containerName: defaultContainer, defaultExpiryMinutes } =
    getAzureStorageConfig();

  const containerName = options.containerName || defaultContainer;
  const cleanBlobName = storageFilePath.replace(/^\/+/, '');
  const expiresInMinutes = options.expiresInMinutes ?? defaultExpiryMinutes;

  // Verify credentials exist
  if (!accountName || !accountKey) {
    // In local dev without Azure credentials, generate a simulated mock download URL
    if (process.env.NODE_ENV !== 'production') {
      const mockExpiry = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
      return `https://${accountName || 'devaccount'}.blob.core.windows.net/${containerName}/${cleanBlobName}?mock_sas=true&expires=${encodeURIComponent(mockExpiry)}&permissions=r`;
    }
    throw new Error(
      'Azure Storage Account Name and Key are required to generate Shared Access Signatures (SAS).'
    );
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  const blobClient = getBlockBlobClient(cleanBlobName, containerName);

  // Time boundaries: allow 5 minutes backward skew tolerance for clock drift
  const now = new Date();
  const startsOn = new Date(now.getTime() - 5 * 60 * 1000);
  const expiresOn = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

  // Read-only permissions
  const permissions = BlobSASPermissions.parse('r');

  const sasQueryParams = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: cleanBlobName,
      permissions,
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https,
      contentDisposition: options.contentDisposition,
    },
    sharedKeyCredential
  );

  const sasToken = sasQueryParams.toString();
  return `${blobClient.url}?${sasToken}`;
}

/**
 * Checks whether a designated asset blob exists in Azure Blob Storage.
 */
export async function checkBlobExists(
  storageFilePath: string,
  containerNameOverride?: string
): Promise<boolean> {
  try {
    const blobClient = getBlockBlobClient(storageFilePath, containerNameOverride);
    return await blobClient.exists();
  } catch (err) {
    console.error('[AzureStorage] Failed to check blob existence:', err);
    return false;
  }
}

export default {
  getBlobServiceClient,
  getContainerClient,
  getBlockBlobClient,
  generatePerkSasUrl,
  checkBlobExists,
};
