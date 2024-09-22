import { describe, expect, it, vi } from 'vitest'
import { useIpLookup } from './useIPCountryLookup'
import type { IPAddressDetails, IPLookupResult, IPLookupService } from './IPLookupService'
import { IPLookupResultType } from './IPLookupService'

describe('useIpLookup', () => {
  it('should make a request when there is no cached result for the IP prefix', async () => {
    const mockLookupService = {
      lookup: vi.fn(),
    };

    const mockData: IPAddressDetails = {
      countryCode: 'US',
      utcOffset: '-0500',
    };

    mockLookupService.lookup.mockResolvedValueOnce(mockData);

    const { lookupCountry } = useIpLookup(mockLookupService);

    await lookupCountry('192.168.0.1');

    expect(mockLookupService.lookup).toHaveBeenCalledTimes(1);
  });

  it('should not make a request if the result is already cached for the same IP prefix', async () => {
    const mockLookupService = {
      lookup: vi.fn(),
    };

    const mockData: IPAddressDetails = {
      countryCode: 'US',
      utcOffset: '-0500',
    };

    mockLookupService.lookup.mockResolvedValueOnce(mockData);

    const { lookupCountry } = useIpLookup(mockLookupService);

    await lookupCountry('192.168.0.1');
    await lookupCountry('192.168.0.100');

    expect(mockLookupService.lookup).toHaveBeenCalledTimes(1);
  });

  it('should not make a request if the request is already in progress for the same IP prefix', async () => {
    const mockLookupService = {
      lookup: vi.fn(),
    };

    const mockData: IPAddressDetails = {
      countryCode: 'US',
      utcOffset: '-0500',
    };

    mockLookupService.lookup.mockResolvedValueOnce(mockData);

    const { lookupCountry } = useIpLookup(mockLookupService);

    await Promise.all([
      lookupCountry('192.168.0.1'),
      lookupCountry('192.168.0.100'),
    ]);

    expect(mockLookupService.lookup).toHaveBeenCalledTimes(1);
  });

  it('should make a request if the result is for a different IP prefix', async () => {
    const mockLookupService = {
      lookup: vi.fn(),
    };

    const mockData: IPAddressDetails = {
      countryCode: 'US',
      utcOffset: '-0500',
    };

    mockLookupService.lookup.mockResolvedValueOnce(mockData);

    const { lookupCountry } = useIpLookup(mockLookupService);

    await lookupCountry('192.168.0.1');
    await lookupCountry('168.192.0.1');

    expect(mockLookupService.lookup).toHaveBeenCalledTimes(2);
  });

  it('should return the lookup result for a given IP in case of an error', async () => {
    const mockLookupService = {
      lookup: vi.fn(() => {
        throw new Error('Lookup failed');
      }),
    };

    const { lookupCountry } = useIpLookup(mockLookupService);

    try {
      await lookupCountry('192.168.0.1');
      await lookupCountry('192.168.0.1');
    } catch (e) {
      // Ignore the error
    }

    expect(mockLookupService.lookup).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple lookups concurrently for different IP prefixes', async () => {
    const ipAddresses = ['192.168.0.1', '10.0.0.1'];

    const lookupService: IPLookupService = {
      async lookup(ip: string) {
        if (ip.startsWith('192.168.0')) {
          return {
            countryCode: 'US',
            utcOffset: '-0500',
          };
        }
        if (ip.startsWith('10.0.0')) {
          return {
            countryCode: 'DE',
            utcOffset: '+0100',
          };
        }
        return {
          error: 'Not resolved',
        };
      }
    };

    const { lookupCountry, getLookupResult } = useIpLookup(lookupService);

    await Promise.all(ipAddresses.map(lookupCountry));

    expect(ipAddresses.map(getLookupResult)).toEqual([
      { countryCode: 'US', utcOffset: '-0500', type: IPLookupResultType.Success },
      { countryCode: 'DE', utcOffset: '+0100', type: IPLookupResultType.Success },
    ]);
  });
});
