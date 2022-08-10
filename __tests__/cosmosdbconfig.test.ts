import 'cdktf/lib/testing/adapters/jest'; // Load types for expect matchers
import { Testing } from 'cdktf';
import {
	CosmosdbAccount, CosmosdbMongoDatabase,
	ResourceGroup,
} from '@cdktf/provider-azurerm';
import { CosmosDBConfig } from '../database/cosmosDBConfig';

describe('Cosmos database', () => {
	const stack = Testing.synthScope((scope) => {
		new CosmosDBConfig(scope, 'my-app-under-test', 'mock-storage-account-name',
			new ResourceGroup(scope, 'mock-resource-group', {
				location: 'mock-location', name: 'mock-name',
			}));
	});

	it('should contain cosmosdb with geo location', () => {
		expect(stack).toHaveResourceWithProperties(CosmosdbAccount, {
			consistency_policy: {
				consistency_level: 'Session',
			},
			geo_location: [{
				failover_priority: 0,
				location: 'East Asia',
			},
			],
			enable_free_tier: true,
			kind: 'MongoDB',
			mongo_server_version: '4.2',
			offer_type: 'Standard',
		});
	});
	it('should contain cosmosdb with mongodb version 4.2', () => {
		expect(stack).toHaveResourceWithProperties(CosmosdbAccount, {
			kind: 'MongoDB',
			mongo_server_version: '4.2',
		});
	});

	it('should have mongo database', () => {
		expect(stack).toHaveResourceWithProperties(CosmosdbMongoDatabase, {
			name: 'mock-storage-account-name-db',
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

				new CosmosDBConfig(stack, 'cosmos-db-under-test', 'mock-storage-account-name', resourceGroup);
			})).toMatchInlineSnapshot(`
"{
  \\"resource\\": {
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
    \\"azurerm_resource_group\\": {
      \\"mock-resource-group\\": {
        \\"location\\": \\"mock-location\\",
        \\"name\\": \\"mock-name\\"
      }
    }
  }
}"
`);

	});
});
