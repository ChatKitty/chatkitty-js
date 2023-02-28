if (typeof global.crypto !== 'object') {
  global.crypto = {
    getRandomValues: (array) => array.map(
      () => Math.floor(Math.random() * 256)),
  };
}
