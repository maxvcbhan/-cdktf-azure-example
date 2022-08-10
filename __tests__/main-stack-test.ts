import 'cdktf/lib/testing/adapters/jest';
import { Testing } from 'cdktf';
import { MyStack } from '../main';

describe('Azure CDKTF Application', () => {
	describe('Checking validity', () => {
		it('check if the produced terraform configuration is valid', () => {
			const app = Testing.app();
			const stack = new MyStack(app, 'test');
			expect(Testing.fullSynth(stack)).toBeValidTerraform();
		});
	});
	it('check if the produced terraform configuration is planing successfully', () => {
		const app = Testing.app();
		const stack = new MyStack(app, 'test');
		expect(Testing.fullSynth(stack)).toPlanSuccessfully();
	});

});
