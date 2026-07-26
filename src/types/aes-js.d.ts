declare module 'aes-js' {
  interface CTR {
    encrypt(bytes: Uint8Array): Uint8Array;
    decrypt(bytes: Uint8Array): Uint8Array;
  }

  interface ModeOfOperationType {
    ctr: new (key: Uint8Array, counter: Uint8Array) => CTR;
  }

  interface AESJS {
    ModeOfOperation: ModeOfOperationType;
  }

  const aesjs: AESJS;
  export default aesjs;
}
