// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

if (typeof global.crypto !== 'object') {
  global.crypto = {
    getRandomValues: (array) => array.map(
      () => Math.floor(Math.random() * 256)),
  };
}
