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

