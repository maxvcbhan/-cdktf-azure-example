import 'cdktf/lib/testing/adapters/jest'; // Load types for expect matchers
import { Testing } from 'cdktf';
import {
	AppServicePlan,
	LinuxWebApp,
	ResourceGroup,
} from '@cdktf/provider-azurerm';
import { CosmosDBConfig } from '../database/cosmosDBConfig';
import { AppServiceConfig } from '../compute/appServiceConfig';
import { BlobStorageConfig } from '../storage/blobStorageConfig';


describe('App service', () => {

	const stack = Testing.synthScope((scope) => {
		const resourceGroup = new ResourceGroup(scope, 'mock-resource-group',
			{
				location: 'mock-location', name: 'mock-name',
			});
		new AppServiceConfig(scope, 'my-app-under-test', 'mock-storage-account-name', resourceGroup,
			new BlobStorageConfig(scope, 'blob-storage-under-test', 'mock-storage-account-name', 'mock-base-app', resourceGroup),
			new CosmosDBConfig(scope, 'cosmos-db-under-test', 'mock-storage-account-name', resourceGroup),
		);
	});


	it('should contain app service plan', () => {
		expect(stack).toHaveResourceWithProperties(AppServicePlan, {
			kind: 'Linux',
			location: 'Central US',
			reserved: true,
			sku: {
				size: 'B1',
				tier: 'Basic',
			},
		});
	});
	it('should contain linux web app', () => {
		expect(stack).toHaveResourceWithProperties(LinuxWebApp, {
			app_settings: {
				AZURE_BLOB_CONNECTION_STRING: expect.any(String),
				AZURE_BLOB_CONTAINER_NAME: expect.any(String),
				AZURE_BLOB_STORAGE_KEY: expect.any(String),
				DOCKER_ENABLE_CI: 'true',
				DOCKER_REGISTRY_SERVER_PASSWORD: '',
				DOCKER_REGISTRY_SERVER_URL: 'https://icr.io',
				DOCKER_REGISTRY_SERVER_USERNAME: 'iamapikey',
				NODE_ENV: 'production',
				PORT: '80',
				QUESTIONNAIRE_MONGO_DB_URI: expect.any(String),
			},
			location: 'Central US',
			site_config: {
				application_stack: {
					docker_image: expect.any(String),
					docker_image_tag: expect.any(String),
				},
				health_check_path: '/live',
			},
		});
	});
});

describe('Unit testing using snapshots', () => {
	it('Tests the blob storage snapshot', () => {
		expect(
			Testing.synthScope((stack) => {
				const resourceGroup = new ResourceGroup(stack, 'mock-resource-group', {
					location: 'mock-location',
					name: 'mock-name',
				});
				const storage = new BlobStorageConfig(stack, 'blob-storage-under-test', 'mock-storage-account-name', 'mock-base-app', resourceGroup);
				const database = new CosmosDBConfig(stack, 'cosmos-db-under-test', 'mock-storage-account-name', resourceGroup);


				new AppServiceConfig(stack, 'my-app-under-test', 'mock-storage-account-name', resourceGroup, storage, database);

			})).toMatchInlineSnapshot(`
"{
  \\"resource\\": {
    \\"azurerm_app_service_plan\\": {
      \\"my-app-under-test_mock-storage-account-name-plan_CA9FD9E5\\": {
        \\"kind\\": \\"Linux\\",
        \\"location\\": \\"Central US\\",
        \\"name\\": \\"mock-storage-account-name\\",
        \\"reserved\\": true,
        \\"resource_group_name\\": \\"\${azurerm_resource_group.mock-resource-group.name}\\",
        \\"sku\\": {
          \\"size\\": \\"B1\\",
          \\"tier\\": \\"Basic\\"
        }
      }
    },
    \\"azurerm_cosmosdb_account\\": {
      \\"cosmos-db-under-test_mock-storage-account-name-cosmos-account_904ED01D\\": {
        \\"consistency_policy\\": {
          \\"consistency_level\\": \\"Session\\"
        },
        \\"enable_automatic_failover\\": false,
        \\"enable_free_tier\\": true,
        \\"geo_location\\": [
          {
            \\"failover_priority\\": 0,
            \\"location\\": \\"East Asia\\"
          }
        ],
        \\"kind\\": \\"MongoDB\\",
        \\"location\\": \\"\${azurerm_resource_group.mock-resource-group.location}\\",
        \\"mongo_server_version\\": \\"4.2\\",
        \\"name\\": \\"mock-storage-account-name-cosmosdb-account\\",
        \\"offer_type\\": \\"Standard\\",
        \\"resource_group_name\\": \\"\${azurerm_resource_group.mock-resource-group.name}\\"
      }
    },
    \\"azurerm_cosmosdb_mongo_collection\\": {
      \\"cosmos-db-under-test_mock-storage-account-name-applications_E39DDF62\\": {
        \\"account_name\\": \\"\${azurerm_cosmosdb_account.cosmos-db-under-test_mock-storage-account-name-cosmos-account_904ED01D.name}\\",
        \\"database_name\\": \\"\${azurerm_cosmosdb_mongo_database.cosmos-db-under-test_mock-storage-account-name-db_1BD416EA.name}\\",
        \\"index\\": [
          {
            \\"keys\\": [
              \\"_id\\"
            ]
          }
        ],
        \\"name\\": \\"applications\\",
        \\"resource_group_name\\": \\"\${azurerm_resource_group.mock-resource-group.name}\\"
      },
      \\"cosmos-db-under-test_mock-storage-account-name-files_2CA6633F\\": {
        \\"account_name\\": \\"\${azurerm_cosmosdb_account.cosmos-db-under-test_mock-storage-account-name-cosmos-account_904ED01D.name}\\",
        \\"database_name\\": \\"\${azurerm_cosmosdb_mongo_database.cosmos-db-under-test_mock-storage-account-name-db_1BD416EA.name}\\",
        \\"index\\": [
          {
            \\"keys\\": [
              \\"_id\\"
            ]
          }
        ],
        \\"name\\": \\"files\\",
        \\"resource_group_name\\": \\"\${azurerm_resource_group.mock-resource-group.name}\\"
      },
      \\"cosmos-db-under-test_mock-storage-account-name-users_A21E98FD\\": {
        \\"account_name\\": \\"\${azurerm_cosmosdb_account.cosmos-db-under-test_mock-storage-account-name-cosmos-account_904ED01D.name}\\",
        \\"database_name\\": \\"\${azurerm_cosmosdb_mongo_database.cosmos-db-under-test_mock-storage-account-name-db_1BD416EA.name}\\",
        \\"index\\": [
          {
            \\"keys\\": [
              \\"_id\\"
            ]
          }
        ],
        \\"name\\": \\"users\\",
        \\"resource_group_name\\": \\"\${azurerm_resource_group.mock-resource-group.name}\\"
      }
    },
    \\"azurerm_cosmosdb_mongo_database\\": {
      \\"cosmos-db-under-test_mock-storage-account-name-db_1BD416EA\\": {
        \\"account_name\\": \\"\${azurerm_cosmosdb_account.cosmos-db-under-test_mock-storage-account-name-cosmos-account_904ED01D.name}\\",
        \\"name\\": \\"mock-storage-account-name-db\\",
        \\"resource_group_name\\": \\"\${azurerm_resource_group.mock-resource-group.name}\\"
      }
    },
    \\"azurerm_linux_web_app\\": {
      \\"my-app-under-test_mock-storage-account-name-app-service_62E6B6F5\\": {
        \\"app_settings\\": {
          \\"AZURE_BLOB_CONNECTION_STRING\\": \\"DefaultEndpointsProtocol=https;AccountName=\${azurerm_storage_account.blob-storage-under-test_mock-base-app-storage-account_57DC6029.name};AccountKey=\${azurerm_storage_account.blob-storage-under-test_mock-base-app-storage-account_57DC6029.primary_access_key};EndpointSuffix=core.windows.net\\",
          \\"AZURE_BLOB_CONTAINER_NAME\\": \\"\${azurerm_storage_container.blob-storage-under-test_mock-base-app-blob-container_EA5C1EFA.name}\\",
          \\"AZURE_BLOB_STORAGE_KEY\\": \\"\${azurerm_storage_account.blob-storage-under-test_mock-base-app-storage-account_57DC6029.primary_access_key}\\",
          \\"DOCKER_ENABLE_CI\\": \\"true\\",
          \\"DOCKER_REGISTRY_SERVER_PASSWORD\\": \\"\\",
          \\"DOCKER_REGISTRY_SERVER_URL\\": \\"https://icr.io\\",
          \\"DOCKER_REGISTRY_SERVER_USERNAME\\": \\"iamapikey\\",
          \\"NODE_ENV\\": \\"production\\",
          \\"PORT\\": \\"80\\",
          \\"QUESTIONNAIRE_MONGO_DB_URI\\": \\"\${element(azurerm_cosmosdb_account.cosmos-db-under-test_mock-storage-account-name-cosmos-account_904ED01D.connection_strings, 0)}/\${azurerm_cosmosdb_mongo_database.cosmos-db-under-test_mock-storage-account-name-db_1BD416EA.name}/undefined\\"
        },
        \\"location\\": \\"Central US\\",
        \\"name\\": \\"mock-storage-account-name\\",
        \\"resource_group_name\\": \\"\${azurerm_resource_group.mock-resource-group.name}\\",
        \\"service_plan_id\\": \\"\${azurerm_app_service_plan.my-app-under-test_mock-storage-account-name-plan_CA9FD9E5.id}\\",
        \\"site_config\\": {
          \\"application_stack\\": {
            \\"docker_image\\": \\"example/example-service\\",
            \\"docker_image_tag\\": \\"v1.0\\"
          },
          \\"health_check_path\\": \\"/live\\"
        }
      }
    },
    \\"azurerm_resource_group\\": {
      \\"mock-resource-group\\": {
        \\"location\\": \\"mock-location\\",
        \\"name\\": \\"mock-name\\"
      }
    },
    \\"azurerm_storage_account\\": {
      \\"blob-storage-under-test_mock-base-app-storage-account_57DC6029\\": {
        \\"account_replication_type\\": \\"LRS\\",
        \\"account_tier\\": \\"Standard\\",
        \\"location\\": \\"\${azurerm_resource_group.mock-resource-group.location}\\",
        \\"name\\": \\"mock-storage-account-name\\",
        \\"resource_group_name\\": \\"\${azurerm_resource_group.mock-resource-group.name}\\"
      }
    },
    \\"azurerm_storage_blob\\": {
      \\"blob-storage-under-test_mock-base-app-blob_1D1CFCB4\\": {
        \\"access_tier\\": \\"Cool\\",
        \\"name\\": \\"document\\",
        \\"storage_account_name\\": \\"\${azurerm_storage_account.blob-storage-under-test_mock-base-app-storage-account_57DC6029.name}\\",
        \\"storage_container_name\\": \\"\${azurerm_storage_container.blob-storage-under-test_mock-base-app-blob-container_EA5C1EFA.name}\\",
        \\"type\\": \\"Block\\"
      }
    },
    \\"azurerm_storage_container\\": {
      \\"blob-storage-under-test_mock-base-app-blob-container_EA5C1EFA\\": {
        \\"container_access_type\\": \\"container\\",
        \\"name\\": \\"mock-base-app-container\\",
        \\"storage_account_name\\": \\"\${azurerm_storage_account.blob-storage-under-test_mock-base-app-storage-account_57DC6029.name}\\"
      }
    }
  }
}"
`);
	});

});
