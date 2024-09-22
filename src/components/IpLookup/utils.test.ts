import { describe, it, expect } from 'vitest';
import { isValidIPAddress } from './utils';

describe('isValidIPAddress', () => {
  // IPv4 Tests
  it('should consider a valid IPv4 address with common octets valid', () => {
    expect(isValidIPAddress('192.168.0.1')).toBe(true);
  });

  it('should consider the maximum possible IPv4 address (255.255.255.255) valid', () => {
    expect(isValidIPAddress('255.255.255.255')).toBe(true);
  });

  it('should consider the minimum possible IPv4 address (0.0.0.0) valid', () => {
    expect(isValidIPAddress('0.0.0.0')).toBe(true);
  });

  it('should consider a localhost IPv4 address (127.0.0.1) valid', () => {
    expect(isValidIPAddress('127.0.0.1')).toBe(true);
  });

  it('should consider an IPv4 address with numbers out of range invalid (e.g., 256.256.256.256)', () => {
    expect(isValidIPAddress('256.256.256.256')).toBe(false);
  });

  it('should consider an incomplete IPv4 address invalid', () => {
    expect(isValidIPAddress('192.168.0')).toBe(false);
  });

  it('should consider an IPv4 address with non-numeric values invalid', () => {
    expect(isValidIPAddress('abc.def.ghi.jkl')).toBe(false);
  });

  // IPv6 Tests
  it('should consider a full valid IPv6 address valid', () => {
    expect(isValidIPAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
  });

  it('should consider a shorthand valid IPv6 address (::1) valid', () => {
    expect(isValidIPAddress('::1')).toBe(true);
  });

  it('should consider a valid link-local IPv6 address (fe80::1) valid', () => {
    expect(isValidIPAddress('fe80::1')).toBe(true);
  });

  it('should consider a valid IPv6 address with compression (2001:db8::ff00:42:8329) valid', () => {
    expect(isValidIPAddress('2001:db8::ff00:42:8329')).toBe(true);
  });

  it('should consider an IPv6 address with too many colons invalid', () => {
    expect(isValidIPAddress('2001:::85a3::0000::8a2e::0370::7334')).toBe(false);
  });

  it('should consider an IPv6 address with an invalid hex character invalid', () => {
    expect(isValidIPAddress('2001::85a3:0000::8a2e:0370g:7334')).toBe(false); // 'g' is invalid in hex
  });

  it('should consider an IPv6 address with zero compression (2001:db8::ff00:42:8329) valid', () => {
    expect(isValidIPAddress('2001:db8::ff00:42:8329')).toBe(true);
  });
});
