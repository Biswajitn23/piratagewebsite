const { mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'piratagewebsite',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUserProfile', inputVars);
}
createUserProfileRef.operationName = 'CreateUserProfile';
exports.createUserProfileRef = createUserProfileRef;

exports.createUserProfile = function createUserProfile(dcOrVars, vars) {
  return executeMutation(createUserProfileRef(dcOrVars, vars));
};
