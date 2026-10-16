import { describe, expect, it } from 'vitest';
import { isPrivateHostname } from './esp32';

describe('isPrivateHostname', () => {
  it('accepts hosts served from this machine', () => {
    for (const host of ['localhost', 'LOCALHOST', 'app.localhost', '127.0.0.1', '::1', '[::1]']) {
      expect(isPrivateHostname(host), host).toBe(true);
    }
  });

  it('accepts private-network addresses and mDNS names', () => {
    for (const host of ['10.0.0.5', '192.168.1.50', '172.16.0.1', '172.31.255.255', 'dhiya.local']) {
      expect(isPrivateHostname(host), host).toBe(true);
    }
  });

  it('rejects public hosts such as GitHub Pages', () => {
    for (const host of ['saracs2.github.io', 'example.com', '8.8.8.8', '172.32.0.1', '172.15.0.1', '192.169.1.1', '']) {
      expect(isPrivateHostname(host), host).toBe(false);
    }
  });
});
