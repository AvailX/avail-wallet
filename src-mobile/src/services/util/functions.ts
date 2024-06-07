import * as platform from 'platform';

export function get_os_function_name(function_name: string): string {
	let function_to_call: string = function_name;
	switch (platform.os?.family) {
		case 'Android': {
			function_to_call += '_android';
			break;
		}

		case 'iOS': {
			function_to_call += '_ios';
			break;
		}

		case 'OS X': {
			function_to_call += '_mac';
			break;
		}

		case 'Windows': {
			function_to_call += '_windows';
			break;
		}

		default: {
			function_to_call = '_linux';
			break;
		}
	}

	return function_to_call;
}
