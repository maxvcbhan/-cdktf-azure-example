import { Construct } from 'constructs';

import {
	CosmosdbAccount, CosmosdbMongoCollection, CosmosdbMongoDatabase,
} from '@cdktf/provider-azurerm';
import { ResourceGroup } from '@cdktf/provider-azurerm/lib/resource-group';


export class CosmosDBConfig extends Construct {
	public readonly cosmosAccount: CosmosdbAccount;
	public readonly cosmosdbMongoDatabase: CosmosdbMongoDatabase;

	constructor(scope: Construct, name: string,
				baseNameApplication: string,
				resourceGroup: ResourceGroup,
	) {
		super(scope, name);
		this.cosmosAccount = new CosmosdbAccount(
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

		this.cosmosdbMongoDatabase = new CosmosdbMongoDatabase(
			this,
			`${baseNameApplication}-db`,
			{
				resourceGroupName: resourceGroup.name,
				accountName: this.cosmosAccount.name,
				name: `${baseNameApplication}-db`,
			},
		);
		['files', 'users', 'applications'].map((collectionName) => {
			return new CosmosdbMongoCollection(
				this,
				`${baseNameApplication}-${collectionName}`,
				{
					name: collectionName,
					index: [{ keys: ['_id'] }],
					resourceGroupName: resourceGroup.name,
					accountName: this.cosmosAccount.name,
					databaseName: this.cosmosdbMongoDatabase.name,
				},
			);
		});
	}
}
