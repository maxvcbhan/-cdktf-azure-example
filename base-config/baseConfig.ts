import { Construct } from 'constructs';

import {
	AzurermProvider,
} from '@cdktf/provider-azurerm';
import { ResourceGroup } from '@cdktf/provider-azurerm/lib/resource-group';
import { AzurermBackend } from 'cdktf';

export class BaseConfig extends Construct {
	public readonly resourceGroup: ResourceGroup;

	constructor(scope: Construct, name: string, baseNameApplication: string,
	) {
		super(scope, name);
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
			`${baseNameApplication}-resource-group`,
			{
				name: 'Development',
				location: 'Southeast Asia',
				tags: { environment: 'dev' },
			},
		);
	}
}
