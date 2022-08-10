import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { config } from 'dotenv';
import { ResourceGroup } from '@cdktf/provider-azurerm/lib/resource-group';
import { BlobStorageConfig } from './storage/blobStorageConfig';
import { CosmosDBConfig } from './database/cosmosDBConfig';
import { AppServiceConfig } from './compute/appServiceConfig';
import { BaseConfig } from './base-config/baseConfig';

config();

export class MyStack extends TerraformStack {
	public readonly resourceGroup: ResourceGroup;

	constructor(scope: Construct, name: string) {
		super(scope, name);
		const storageAccountName = 'cloudportalac';
		const baseNameApplication = 'cloud-example';
		const baseConfig = new BaseConfig(this, 'resourceGroup', baseNameApplication);
		this.resourceGroup = baseConfig.resourceGroup;
		const blobStorage = new BlobStorageConfig(this, 'blob-storage', storageAccountName, baseNameApplication, this.resourceGroup);
		const cosmosDB = new CosmosDBConfig(this, 'cosmosdb', baseNameApplication, this.resourceGroup);
		new AppServiceConfig(this, 'app-service', baseNameApplication, this.resourceGroup, blobStorage, cosmosDB);

	}
}

const app = new App();
new MyStack(app, 'terraform');
app.synth();
