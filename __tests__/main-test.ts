import 'cdktf/lib/testing/adapters/jest'; // Load types for exp

describe('My CDKTF Application', () => {
  // The tests below are example tests, you can find more information at
  // https://cdk.tf/testing
  it.todo('should be tested');

  // All Unit testst test the synthesised terraform code, it does not create real-world resources
  describe('Unit testing using assertions', () => {
    xit('should contain a resource', () => {
      // const stack = Testing.synthScope((scope) => {
      //   new MyApplicationsAbstraction(scope, 'my-app-under-test');
      // });
	  //
      // expect(stack).toHaveResourceWithProperties(ResourceGroup, {
      //   name: 'acc',
      // });
    });
  });
});
