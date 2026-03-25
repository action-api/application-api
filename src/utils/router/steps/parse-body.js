
export function parseBody(body) {
	try {
		return body ? JSON.parse(body) : null;
	} catch {
		return body;
	}
}
