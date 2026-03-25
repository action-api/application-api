import {cognito} from '@trusquetta/aws-cognito';

export class Auth {
	/**
	 * 認証されていない場合は null
	 * @type {null | {
	 *   sub: string,
	 *   identityId: string | null,
	 *   $meta: {
	 *     provider: string | null,
	 *     userPoolId: string | null,
	 *     signInType: string | null,
	 *     sourceIp: string | null,
	 *     userAgent: string | null,
	 *     caller: string | null,
	 *     userArn: string | null,
	 *   },
	 * }}
	 */
	user = null;

	/**
	 * @param {import('aws-lambda').APIGatewayEvent} event
	 * @returns {Promise<void>}
	 */
	constructor(event) {
		const {
			cognitoIdentityId: identityId,
			cognitoAuthenticationProvider,
			sourceIp,
			userAgent,
			caller,
			userArn,
		} = event.requestContext.identity;
		if (!cognitoAuthenticationProvider) {
			return;
		}

		const [
			providerWithPool = null,
			signInType = null,
			sub = null,
		] = cognitoAuthenticationProvider.split(':');
		if (!providerWithPool) {
			return;
		}

		const [provider = null, userPoolId = null] = providerWithPool.split('/');
		this.user = {
			sub,
			identityId,
			$meta: {
				provider,
				userPoolId,
				signInType,
				sourceIp,
				userAgent,
				caller,
				userArn,
			},
		};
	}

	/**
	 * @returns {Promise<UserType | null>}
	 */
	async fetchCurrentAuthenticationUser() {
		const {sub} = this.user || {};
		if (!sub) {
			return null;
		}

		const {Users} = await cognito.listUsers({
			Filter: `sub = "${sub}"`,
			Limit: 1,
		});
		return Users[0];
	}
}
