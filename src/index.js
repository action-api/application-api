import {router} from './utils/router/index.js';

const config = {
	actionsPath: './actions',
	serviceMapToFunctionName: {
		example: 'example-service',
	},
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
	const {httpMethod, path, body, requestContext} = event;
	const {cognitoAuthenticationProvider, cognitoIdentityId, sourceIp} = requestContext.identity;

	const response = await router(event, config);

	// LOGGING
	console.log({
		httpMethod,
		path,
		body,
		cognitoAuthenticationProvider,
		cognitoIdentityId,
		sourceIp,
		response,
	});

	return response;
}
