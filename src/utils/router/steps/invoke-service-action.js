import {lambda} from '@dependahub/aws-lambda';

export async function invokeServiceAction({serviceMapToFunctionName, serviceName, actionName, payload}) {
	const lambdaFunctionName = serviceMapToFunctionName[serviceName];
	if (!lambdaFunctionName) {
		const error = new Error(`Service "${serviceName}" is not found`);
		error.statusCode = 404;
		throw error;
	}

	return lambda.post(lambdaFunctionName, {
		action: actionName,
		payload,
	});
}
