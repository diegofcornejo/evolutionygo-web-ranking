import { TextEncoder, TextDecoder } from 'util';

// Override the global TextEncoder/TextDecoder to ensure esbuild invariant passes.
// Align Uint8Array with the encoder's realm in jsdom/Bun.
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

const encoded = new globalThis.TextEncoder().encode('');
if (!(encoded instanceof globalThis.Uint8Array)) {
  globalThis.Uint8Array = encoded.constructor;
}
