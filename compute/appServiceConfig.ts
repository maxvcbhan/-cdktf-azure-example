import { Construct } from 'constructs';

import {
	AppServicePlan,
	LinuxWebApp,
} from '@cdktf/provider-azurerm';
import { ResourceGroup } from '@cdktf/provider-azurerm/lib/resource-group';
import { Fn } from 'cdktf';
import { BlobStorageConfig } from '../storage/blobStorageConfig';
import { CosmosDBConfig } from '../database/cosmosDBConfig';

export class AppServiceConfig extends Construct {
	public readonly appServicePlan: AppServicePlan;
	public readonly linuxWebApp: LinuxWebApp;

	constructor(scope: Construct, name: string,
				baseNameApplication: string,
				resourceGroup: ResourceGroup,
				blobStorageConfig: BlobStorageConfig,
				cosmosDBConfig: CosmosDBConfig,
	) {
		super(scope, name);
		this.appServicePlan = new AppServicePlan(
			this,
			`${baseNameApplication}-plan`,
			{
				resourceGroupName: resourceGroup.name,
				name: `${baseNameApplication}`,
				kind: 'Linux',
				reserved: true,
				location: 'Central US',
				sku: {
					tier: 'Basic',
					size: 'B1',
				},
			},
		);
		const urlString = Fn.element(cosmosDBConfig.cosmosAccount.connectionStrings, 0).split(
			'/?',
		);
		const dbConnectionWithDB = `${urlString[0]}/${cosmosDBConfig.cosmosdbMongoDatabase.name}/${urlString[1]}`;
		this. linuxWebApp = new LinuxWebApp(this, `${baseNameApplication}-app-service`, {
			name: `${baseNameApplication}`,
			servicePlanId: this.appServicePlan.id,
			location: 'Central US',
			resourceGroupName: resourceGroup.name,
			appSettings: {
				QUESTIONNAIRE_MONGO_DB_URI: `${dbConnectionWithDB}`,
				PORT: '80',
				NODE_ENV: 'production',
				AZURE_BLOB_CONTAINER_NAME: `${blobStorageConfig.container.name}`,
				DOCKER_ENABLE_CI: 'true',
				DOCKER_REGISTRY_SERVER_URL: 'https://icr.io',
				DOCKER_REGISTRY_SERVER_USERNAME: 'iamapikey',
				DOCKER_REGISTRY_SERVER_PASSWORD:
					process.env.DOCKER_REGISTRY_SERVER_PASSWORD || '',
				AZURE_BLOB_CONNECTION_STRING: `DefaultEndpointsProtocol=https;AccountName=${blobStorageConfig.storageAccount.name};AccountKey=${blobStorageConfig.storageAccount.primaryAccessKey};EndpointSuffix=core.windows.net`,
				AZURE_BLOB_STORAGE_KEY: `${blobStorageConfig.storageAccount.primaryAccessKey}`,
			},
			siteConfig: {
				applicationStack: {
					dockerImage: 'example/example-service',
					dockerImageTag:
						'v1.0',
				},
				healthCheckPath: '/live',
			},
		});
	}
}
