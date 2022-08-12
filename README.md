# CDKTF Azure example

## How to run the application
1. copy .example.env and rename to .env
2. update the ENV values in .env file

## remartk
this app use remote backend state to store the terraform state in azure blob storage

## use local terraform state store instead of remote backend
comment is code block in baseconfig.tf class
```typescript
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
```
