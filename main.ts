import { Construct } from 'constructs';
import { App, AzurermBackend, TerraformStack, Fn } from 'cdktf';
import {
  AppServicePlan,
  AzurermProvider,
  CosmosdbAccount,
  CosmosdbMongoCollection,
  CosmosdbMongoDatabase,
  LinuxWebApp,
  StorageAccount,
  StorageBlob,
  StorageContainer,
} from '@cdktf/provider-azurerm';
import { StorageAccountConfig } from '@cdktf/provider-azurerm/lib/storage-account';
import { config } from 'dotenv';
import { ResourceGroup } from '@cdktf/provider-azurerm/lib/resource-group';

config();

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);
    const storageAccountName = 'cloudportalac';
    const baseNameApplication = 'cloud-portal';
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
    const resourceGroup = new ResourceGroup(
      this,
      `${baseNameApplication}resource-group`,
      {
        name: 'Development',
        location: 'Southeast Asia',
        tags: { environment: 'dev' },
      },
    );
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
    const cosmosdbAccount = new CosmosdbAccount(
      this,
      `${baseNameApplication}-cosmos-account`,
      {
        name: `${baseNameApplication}-cosmosdb-account`,
        location: resourceGroup.location,
        resourceGroupName: resourceGroup.name,
        offerType: 'Standard',
        kind: 'MongoDB',
        enableAutomaticFailover: false,
        mongoServerVersion: '4.2',
        enableFreeTier: true,
        consistencyPolicy: {
          consistencyLevel: 'Session',
        },
        geoLocation: [
          {
            failoverPriority: 0,
            location: 'East Asia',
          },
        ],
      },
    );

    const cosmosdbMongoDatabase = new CosmosdbMongoDatabase(
      this,
      `${baseNameApplication}-db`,
      {
        resourceGroupName: resourceGroup.name,
        accountName: cosmosdbAccount.name,
        name: `${baseNameApplication}-db`,
      },
    );
    const collectionNames = [
      'questionnaires',
      'files',
      'users',
      'applications',
    ];
    collectionNames.map((collectionName) => {
      return new CosmosdbMongoCollection(
        this,
        `${baseNameApplication}-${collectionName}`,
        {
          name: collectionName,
          index: [{ keys: ['_id'] }],
          resourceGroupName: resourceGroup.name,
          accountName: cosmosdbAccount.name,
          databaseName: cosmosdbMongoDatabase.name,
        },
      );
    });
    const appServicePlan = new AppServicePlan(
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
    const urlString = Fn.element(cosmosdbAccount.connectionStrings, 0).split(
      '/?',
    );
    const dbconnectionWithDB = `${urlString[0]}/${cosmosdbMongoDatabase.name}/${urlString[1]}`;
    new LinuxWebApp(this, `${baseNameApplication}-app-service`, {
      name: `${baseNameApplication}`,
      servicePlanId: appServicePlan.id,
      location: 'Central US',
      resourceGroupName: resourceGroup.name,
      appSettings: {
        QUESTIONNAIRE_MONGO_DB_URI: `${dbconnectionWithDB}`,
        PORT: '80',
        NODE_ENV: 'production',
        AZURE_BLOB_CONTAINER_NAME: `${container.name}`,
        DOCKER_ENABLE_CI: 'true',
        DOCKER_REGISTRY_SERVER_URL: 'https://icr.io',
        DOCKER_REGISTRY_SERVER_USERNAME: 'iamapikey',
        DOCKER_REGISTRY_SERVER_PASSWORD:
          process.env.DOCKER_REGISTRY_SERVER_PASSWORD || '',
        AZURE_BLOB_CONNECTION_STRING: `DefaultEndpointsProtocol=https;AccountName=${sa.name};AccountKey=${sa.primaryAccessKey};EndpointSuffix=core.windows.net`,
        AZURE_BLOB_STORAGE_KEY: `${sa.primaryAccessKey}`,
      },
      siteConfig: {
        applicationStack: {
          dockerImage: 'client-engineering/cloud-portal-questionnaire-service',
          dockerImageTag:
            'c0e6330bf4f75b71d59fa316a9c4d34778bf15594f76eaa992e6477da87d8691',
        },
        healthCheckPath: '/live',
      },
    });
  }
}

const app = new App();
new MyStack(app, 'terraform');
app.synth();
