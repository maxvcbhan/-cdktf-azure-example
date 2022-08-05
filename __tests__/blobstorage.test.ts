import 'cdktf/lib/testing/adapters/jest'; // Load types for expect matchers
import { Testing } from 'cdktf';
import { BlobStorageConfig } from '../storage/blobStorageConfig';
import {
	ResourceGroup,
	StorageAccount, StorageBlob,
	StorageContainer,
} from '@cdktf/provider-azurerm';

describe('My CDKTF Application', () => {

	describe('Block storage', () => {
		const stack = Testing.synthScope((scope) => {
			new BlobStorageConfig(scope, 'my-app-under-test', 'mock-storage-account-name','mock-base-app',
				new ResourceGroup(scope, 'acc', {
					location: 'mock-location', name: 'mock-name',
				}));
		});

		it('should contain a storage account', () => {
			expect(stack).toHaveResourceWithProperties(StorageAccount, {
				account_replication_type: 'LRS',
				account_tier: 'Standard',
			});
		});
		it('should have storage container', () => {
			expect(stack).toHaveResourceWithProperties(StorageContainer, {
				container_access_type: 'container',
			});
		});
		it('should have storage blob', () => {
			expect(stack).toHaveResourceWithProperties(StorageBlob, {
				access_tier: 'Cool',
				type: 'Block',
			});
		});

	});
});
