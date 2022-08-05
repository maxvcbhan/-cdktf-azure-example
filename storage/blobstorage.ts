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


export class BlobStorage extends Construct {

	constructor(scope: Construct, name: string,
				storageAccountName: string,
				resourceGroup: ResourceGroup,
				baseNameApplication: string,
	) {
		super(scope, name);

		const storageConfig: StorageAccountConfig = {
			accountTier: 'Standard',
			resourceGroupName: resourceGroup.name,
			name: storageAccountName,
			location: resourceGroup.location,
			accountReplicationType: 'LRS',
		};
		const sa = new StorageAccount(
			this,
			`${baseNameApplication}-storage-account`,
			storageConfig,
		);
		const container: StorageContainer = new StorageContainer(
			this,
			`${baseNameApplication}-blob-container`,
			{
				name: `${baseNameApplication}-container`,
				containerAccessType: 'container',
				storageAccountName: sa.name,
			},
		);
		new StorageBlob(this, `${baseNameApplication}-blob`, {
			accessTier: 'Cool',
			storageAccountName: sa.name,
			name: 'document',
			storageContainerName: container.name,
			type: 'Block',
		});
	}
}
