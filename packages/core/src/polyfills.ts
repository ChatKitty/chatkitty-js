// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

if (!global) {
  global = {};
}

if (typeof global.crypto !== 'object') {
  global.crypto = {
    getRandomValues: (array) =>
      array.map(() => Math.floor(Math.random() * 256)),
  };
}

if (
  typeof global.TextEncoder !== 'object' ||
  typeof global.TextDecoder !== 'object'
) {
  import('text-encoding/lib/encoding.js').then((encoding) => {
    global.TextEncoder = encoding.TextEncoder;
    global.TextDecoder = encoding.TextDecoder;
  });
}
