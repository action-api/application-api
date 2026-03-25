import {parseBody} from './steps/parse-body.js';
import {invokeLocalAction} from './steps/invoke-local-action.js';
import {invokeServiceAction} from './steps/invoke-service-action.js';

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function router(event, config = {}) {
	const {httpMethod, path, body} = event;
	const {
		actionsPath = './actions',
		serviceMapToFunctionName = {},
	} = config;
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

	try {
		const [_apiVersion, serviceName, actionName] = path.split('/').filter(Boolean);
		const localActionsPath = path.resolve(actionsPath);
		const payload = parseBody(body);

		switch (httpMethod) {
			// CORSプリフライトリクエストへの対応
			case 'OPTIONS': {
				return response;
			}

			// アクションルーティング
			case 'POST': {
				// ローカルアクションの実行
				if (serviceName === 'local') {
					return await invokeLocalAction({
						localActionsPath,
						actionName,
						payload,
					});
				}

				// Service直結
				return await invokeServiceAction({
					serviceMapToFunctionName,
					serviceName,
					actionName,
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
