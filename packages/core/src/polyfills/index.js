import "./text-encoding"

const scope = typeof window !== "undefined" ?
  window : typeof global !== "undefined" ?
    global : this;

if (typeof scope.crypto !== 'object') {
  scope.crypto = {
    getRandomValues: (array) =>
      array.map(() => Math.floor(Math.random() * 256)),
  };
}
