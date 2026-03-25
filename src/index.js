import {Auth} from 'utils/auth/index.js';
import {router} from './utils/router/index.js';
import * as config from './config.js';

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
	const {httpMethod, path, body, requestContext} = event;
	const {cognitoAuthenticationProvider, cognitoIdentityId, sourceIp} = requestContext.identity;

	const auth = new Auth(event);
	await auth.fetchCurrentAuthenticationUser();

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
