const scope =
  typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : this;

if (typeof scope.crypto !== 'object') {
  scope.crypto = {
    getRandomValues: (array) =>
      array.map(() => Math.floor(Math.random() * 256)),
  };
}

if (
  typeof scope.TextEncoder !== 'object' ||
  typeof scope.TextDecoder !== 'object'
) {
  import('text-encoding-polyfill/lib/encoding.js').then((encoding) => {
    scope.TextEncoder = encoding.TextEncoder;
    scope.TextDecoder = encoding.TextDecoder;
  });
}
