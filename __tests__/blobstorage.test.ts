import 'cdktf/lib/testing/adapters/jest'; // Load types for expect matchers
import { Testing } from 'cdktf';
import { BlobStorageConfig } from '../storage/blobStorageConfig';
import {
	ResourceGroup,
	StorageAccount, StorageBlob,
	StorageContainer,
} from '@cdktf/provider-azurerm';

const dotenv = require('dotenv');
dotenv.config({ path: '.development.env' });
console.log(process.env);
describe('My CDKTF Application', () => {

	describe('Block storage', () => {
		const stack = Testing.synthScope((scope) => {
			new BlobStorageConfig(scope, 'my-app-under-test', 'mock-storage-account-name', 'mock-base-app',
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
describe('Unit testing using snapshots', () => {
	it('Tests the blob storage snapshot', () => {
		expect(
			Testing.synthScope((stack) => {
				new BlobStorageConfig(stack, 'my-app-under-test', 'mock-storage-account-name', 'mock-base-app',
					new ResourceGroup(stack, 'acc', {
						location: 'mock-location', name: 'mock-name',
					}));

			})).toMatchInlineSnapshot(`
"{
  \\"resource\\": {
    \\"azurerm_resource_group\\": {
      \\"acc\\": {
        \\"location\\": \\"mock-location\\",
        \\"name\\": \\"mock-name\\"
      }
    },
    \\"azurerm_storage_account\\": {
      \\"my-app-under-test_mock-base-app-storage-account_A4E8D618\\": {
        \\"account_replication_type\\": \\"LRS\\",
        \\"account_tier\\": \\"Standard\\",
        \\"location\\": \\"\${azurerm_resource_group.acc.location}\\",
        \\"name\\": \\"mock-storage-account-name\\",
        \\"resource_group_name\\": \\"\${azurerm_resource_group.acc.name}\\"
      }
    },
    \\"azurerm_storage_blob\\": {
      \\"my-app-under-test_mock-base-app-blob_B52E41CB\\": {
        \\"access_tier\\": \\"Cool\\",
        \\"name\\": \\"document\\",
        \\"storage_account_name\\": \\"\${azurerm_storage_account.my-app-under-test_mock-base-app-storage-account_A4E8D618.name}\\",
        \\"storage_container_name\\": \\"\${azurerm_storage_container.my-app-under-test_mock-base-app-blob-container_E605FBD8.name}\\",
        \\"type\\": \\"Block\\"
      }
    },
    \\"azurerm_storage_container\\": {
      \\"my-app-under-test_mock-base-app-blob-container_E605FBD8\\": {
        \\"container_access_type\\": \\"container\\",
        \\"name\\": \\"mock-base-app-container\\",
        \\"storage_account_name\\": \\"\${azurerm_storage_account.my-app-under-test_mock-base-app-storage-account_A4E8D618.name}\\"
      }
    }
  }
}"
`);
	});
});


