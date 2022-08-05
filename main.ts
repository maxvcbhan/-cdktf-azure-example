import {Construct} from "constructs";
import {App, AzurermBackend, TerraformStack} from "cdktf";
import {
	AzurermProvider,
	StorageAccount,
	StorageBlob, StorageContainer
} from "@cdktf/provider-azurerm";
import {
	StorageAccountConfig
} from "@cdktf/provider-azurerm/lib/storage-account";
import {config} from "dotenv";

config();

class MyStack extends TerraformStack {
	constructor(scope: Construct, name: string) {
		super(scope, name);
		const storageAccountName = "cloudportalcdktf";

		new AzurermBackend(this, {
			storageAccountName: "tfstate2762",
			resourceGroupName: "tfstate",
			containerName: "tfstate",
			key: "tfstate",
			useMsi: true,
			subscriptionId: process.env.SUBSCRIPTION_ID || "",
			clientId: process.env.CLIENT_ID || "",
			clientSecret: process.env.CLIENTSECRET || "",
			tenantId: process.env.TENANT_ID || ""
		});

		new AzurermProvider(this, "azure", {
			features: {
				apiManagement: {
					purgeSoftDeleteOnDestroy: true,
					recoverSoftDeleted: true
				},
				applicationInsights: {
					disableGeneratedRule: false
				},
				cognitiveAccount: {
					purgeSoftDeleteOnDestroy: true
				},

				keyVault: {
					purgeSoftDeleteOnDestroy: true,
					recoverSoftDeletedKeys: true
				},

				logAnalyticsWorkspace: {
					permanentlyDeleteOnDestroy: true
				},

				resourceGroup: {
					preventDeletionIfContainsResources: true
				},

				templateDeployment: {
					deleteNestedItemsDuringDeletion: true
				},

				virtualMachine: {
					deleteOsDiskOnDeletion: true,
					gracefulShutdown: false,
					skipShutdownAndForceDelete: false,
				},

				virtualMachineScaleSet: {
					forceDelete: false,
					rollInstancesWhenRequired: true,
					scaleToZeroBeforeDeletion: true
				},

			},

		})
		const storageConfig: StorageAccountConfig = {
			accountTier: "Standard",
			resourceGroupName: "testLB",
			name: storageAccountName,
			location: "Southeast Asia",
			accountReplicationType: "LRS"
		}
		const sa = new StorageAccount(this, "storage-account", storageConfig);
		const container: StorageContainer = new StorageContainer(this, "container-name", {
			name: "cloud-portal-document",
			containerAccessType: "container",
			storageAccountName: storageConfig.name
		});
		new StorageBlob(this, "terraform-state", {
			accessTier: "Hot",
			storageAccountName: sa.name,
			name: "terraform state",
			storageContainerName: container.name,
			type: "Block"
		});
	}
}

const app = new App();
new MyStack(app, "terraform");
app.synth();
