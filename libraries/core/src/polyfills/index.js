import * as encoding from 'text-encoding-polyfill';

const scope =
	typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};

if (typeof scope.crypto !== 'object') {
	scope.crypto = {
		getRandomValues: (array) => array.map(() => Math.floor(Math.random() * 256)),
	};
}

if (typeof scope.TextEncoder !== 'object' || typeof scope.TextDecoder !== 'object') {
	scope.TextEncoder = encoding.TextEncoder;
	scope.TextDecoder = encoding.TextDecoder;
}
