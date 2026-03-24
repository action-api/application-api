import {lambda} from '@dependahub/aws-lambda';

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
	const {httpMethod, path, body, requestContext} = event;
	const {cognitoAuthenticationProvider, cognitoIdentityId, sourceIp} = requestContext.identity;

	const response = await router(event);

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

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function router(event) {
	const {httpMethod, path, body} = event;
	const [_apiVersion, serviceName, actionName] = path.split('/').filter(Boolean);
	const response = {
		headers: {
			'Access-Control-Allow-Credentials': false,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
			'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
		},
		statusCode: 200,
		body: null,
	};

	// parse body
	const payload = (() => {
		try {
			return body ? JSON.parse(body) : null;
		} catch {
			return body;
		}
	})();

	try {
		switch (httpMethod) {
			case 'OPTIONS': {
				return response;
			}

			case 'POST': {
				const isRunLocalAction = serviceName === 'this';
				if (isRunLocalAction) {
					return routerForLocalAction({actionName, payload});
				}

				// Service直結
				return await lambda.post(functionName, {
					action: actionName,
					payload,
				});
			}

			default: {
				const error = new Error(`Unsupported method "${httpMethod}"`);
				error.statusCode = 400;
				throw error;
			}
		}
	} catch (error) {
		response.statusCode = error.statusCode || 500;
		response.body = JSON.stringify({
			name: error.name,
			message: error.message,
			stack: error.stack,
		});
	}

	return response;
}

export async function routerForLocalAction({actionName, payload}) {
	// ローカルアクションを実行
}
