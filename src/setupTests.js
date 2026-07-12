// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom doesn't reliably expose crypto.randomUUID depending on the Node
// version running the test suite; the app calls it unconditionally when
// creating stock items/decals, so polyfill it here rather than in app code.
if (!global.crypto || typeof global.crypto.randomUUID !== 'function') {
  const nodeCrypto = require('crypto');
  global.crypto = { ...(global.crypto || {}), randomUUID: () => nodeCrypto.randomUUID() };
}

// jsdom doesn't expose TextEncoder/TextDecoder either; shareableUrl.js uses
// them to base64-encode the shareable-link hash.
if (typeof global.TextEncoder === 'undefined' || typeof global.TextDecoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = global.TextEncoder || TextEncoder;
  global.TextDecoder = global.TextDecoder || TextDecoder;
}
