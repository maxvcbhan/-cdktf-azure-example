import { Construct } from 'constructs';
import {
	StorageAccountConfig,
} from '@cdktf/provider-azurerm/lib/storage-account';
import {
	StorageAccount,
	StorageBlob,
	StorageContainer,
} from '@cdktf/provider-azurerm';
import { ResourceGroup } from '@cdktf/provider-azurerm/lib/resource-group';


export class BlobStorageConfig extends Construct {
	public readonly container: StorageContainer;
	public readonly storageAccount: StorageAccount;
	public readonly storageConfig: StorageAccountConfig;
	public readonly storageBlob: StorageBlob;

	constructor(scope: Construct, name: string,
				storageAccountName: string,
				baseNameApplication: string,
				resourceGroup: ResourceGroup,
	) {
		super(scope, name);

		this.storageConfig = {
			accountTier: 'Standard',
			resourceGroupName: resourceGroup.name,
			name: storageAccountName,
			location: resourceGroup.location,
			accountReplicationType: 'LRS',
		};
		this.storageAccount = new StorageAccount(
			this,
			`${baseNameApplication}-storage-account`,
			this.storageConfig,
		);
		this.container = new StorageContainer(
			this,
			`${baseNameApplication}-blob-container`,
			{
				name: `${baseNameApplication}-container`,
				containerAccessType: 'container',
				storageAccountName: this.storageAccount.name,
			},
		);
		this.storageBlob = new StorageBlob(this, `${baseNameApplication}-blob`, {
			accessTier: 'Cool',
			storageAccountName: this.storageAccount.name,
			name: 'document',
			storageContainerName: this.container.name,
			type: 'Block',
		});
	}
}
