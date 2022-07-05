import {Construct} from "constructs";
import {App, AzurermBackend, TerraformStack} from "cdktf";
import {
	AzurermProvider,
	CosmosdbAccount, CosmosdbMongoCollection, CosmosdbMongoDatabase,
	StorageAccount,
	StorageBlob,
	StorageContainer
} from "@cdktf/provider-azurerm";
import {
	StorageAccountConfig
} from "@cdktf/provider-azurerm/lib/storage-account";
import {config} from "dotenv";

config();

class MyStack extends TerraformStack {
	constructor(scope: Construct, name: string) {
		super(scope, name);
		const storageAccountName = "cloudportalac";
		const resourceGroupName = "testLB";
		const baseNameApplication = "cloud-portal";
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
			subscriptionId: process.env.SUBSCRIPTION_ID || "",
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
			name: `${baseNameApplication}-document`,
			containerAccessType: "container",
			storageAccountName: storageConfig.name
		});
		new StorageBlob(this, `${baseNameApplication}-blob`, {
			accessTier: "Cool",
			storageAccountName: sa.name,
			name: "document",
			storageContainerName: container.name,
			type: "Block"
		});
		const cosmosdbAccount = new CosmosdbAccount(this, `${baseNameApplication}-cosmos-account`, {
			name: `${baseNameApplication}-cosmosdb-account`,
			location: "Southeast Asia",
			resourceGroupName: resourceGroupName,
			offerType: "Standard",
			kind: "MongoDB",
			enableAutomaticFailover: false,
			mongoServerVersion: "4.2",
			enableFreeTier: true,
			consistencyPolicy: {
				consistencyLevel: "Session"
			},
			geoLocation: [{
				failoverPriority: 0,
				location: "East Asia"
			}]

		});

		const cosmosdbMongoDatabase = new CosmosdbMongoDatabase(this, `${baseNameApplication}-db`, {
			resourceGroupName: resourceGroupName,
			accountName: cosmosdbAccount.name,
			name: `${baseNameApplication}-db`
		})
		const collectionNames = ["questionnaires", "files", "users", "assessment"];
		collectionNames.map((collectionName) => {
			return new CosmosdbMongoCollection(this, `${baseNameApplication}-${collectionName}`, {
				name: collectionName,
				index: [{keys: ["_id"]}],
				resourceGroupName: resourceGroupName,
				accountName: cosmosdbAccount.name,
				databaseName: cosmosdbMongoDatabase.name
			})
		})
	}
}

const app = new App();
new MyStack(app, "terraform");
app.synth();
