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
				DOCKER_ENABLE_CI: "true",
				DOCKER_REGISTRY_SERVER_PASSWORD: "",
				DOCKER_REGISTRY_SERVER_URL: "https://icr.io",
				DOCKER_REGISTRY_SERVER_USERNAME: "iamapikey",
				NODE_ENV: "production",
				PORT: "80",
				QUESTIONNAIRE_MONGO_DB_URI: expect.any(String)
			},
			location: "Central US",
			site_config: {
				application_stack: {
					docker_image: expect.any(String),
					docker_image_tag: expect.any(String)
				},
				health_check_path: "/live"
			}
		});
	});
});

