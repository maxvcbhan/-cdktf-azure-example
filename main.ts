import { Construct } from 'constructs';
import { App, AzurermBackend, TerraformStack } from 'cdktf';
import {
	AzurermProvider,
} from '@cdktf/provider-azurerm';
import { config } from 'dotenv';
import { ResourceGroup } from '@cdktf/provider-azurerm/lib/resource-group';
import { BlobStorageConfig } from './storage/blobStorageConfig';
import { CosmosDBConfig } from './database/cosmosDBConfig';
import { AppServiceConfig } from './compute/appServiceConfig';

config();

class MyStack extends TerraformStack {
	public readonly resourceGroup: ResourceGroup;

	constructor(scope: Construct, name: string) {
		super(scope, name);
		const storageAccountName = 'cloudportalac';
		const baseNameApplication = 'cloud-example';
		new AzurermBackend(this, {
			storageAccountName: 'tfstate2762',
			resourceGroupName: 'tfstate',
			containerName: 'tfstate',
			key: 'tfstate',
			useMsi: true,
			subscriptionId: process.env.SUBSCRIPTION_ID || '',
			clientId: process.env.CLIENT_ID || '',
			clientSecret: process.env.CLIENTSECRET || '',
			tenantId: process.env.TENANT_ID || '',
		});

		new AzurermProvider(this, 'azure', {
			subscriptionId: process.env.SUBSCRIPTION_ID || '',
			features: {
				apiManagement: {
					purgeSoftDeleteOnDestroy: true,
					recoverSoftDeleted: true,
				},
				applicationInsights: {
					disableGeneratedRule: false,
				},
				cognitiveAccount: {
					purgeSoftDeleteOnDestroy: true,
				},

				keyVault: {
					purgeSoftDeleteOnDestroy: true,
					recoverSoftDeletedKeys: true,
				},

				logAnalyticsWorkspace: {
					permanentlyDeleteOnDestroy: true,
				},

				resourceGroup: {
					preventDeletionIfContainsResources: true,
				},

				templateDeployment: {
					deleteNestedItemsDuringDeletion: true,
				},

				virtualMachine: {
					deleteOsDiskOnDeletion: true,
					gracefulShutdown: false,
					skipShutdownAndForceDelete: false,
				},

				virtualMachineScaleSet: {
					forceDelete: false,
					rollInstancesWhenRequired: true,
					scaleToZeroBeforeDeletion: true,
				},
			},
		});
		this.resourceGroup = new ResourceGroup(
			this,
			`${baseNameApplication}resource-group`,
			{
				name: 'Development',
				location: 'Southeast Asia',
				tags: { environment: 'dev' },
			},
		);

		const blobStorage = new BlobStorageConfig(this, 'blob-storage', storageAccountName, baseNameApplication, this.resourceGroup);
		const cosmosDB = new CosmosDBConfig(this, 'cosmosdb', baseNameApplication, this.resourceGroup);
		new AppServiceConfig(this, 'app-service', baseNameApplication, this.resourceGroup, blobStorage, cosmosDB);

	}
}

const app = new App();
new MyStack(app, 'terraform');
app.synth();
