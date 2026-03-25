import path from 'node:path';
import camelCase from 'lodash.camelcase';
import kebabCase from 'lodash.kebabcase';

export async function invokeLocalAction({actionsPath, actionName, payload}) {
	const actionNameKekab = kebabCase(actionName);
	const actionNameCamel = camelCase(actionNameKekab);
	const localActionsPath = path.resolve(actionsPath);
	const filePath = path.join(localActionsPath, actionNameKekab, 'index.js');
	const module = await (async () => {
		try {
			return await import(filePath);
		} catch (error) {
			if (error.code === 'ERR_MODULE_NOT_FOUND') {
				const error = new Error('Directory Not Found');
				error.name = 'RouteError';
				error.statusCode = 404;
				error.cause = {filePath};
			}

			throw error;
		}
	})();
	const action = module[actionNameCamel];
	if (typeof action !== 'function') {
		const error = new Error('Action Not Found');
		error.name = 'RouteError';
		error.statusCode = 404;
		error.cause = {action: actionNameCamel};
		throw error;
	}

	return action(payload);
}
