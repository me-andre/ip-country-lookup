import { reactive } from 'vue'
import type { IPLookupResult, IPLookupService } from '@/components/IpLookup/IPLookupService'
import { IPLookupResultType } from '@/components/IpLookup/IPLookupService'

export function useIpLookup(ipLookupService: IPLookupService) {
  // Cache lookup results, keyed by the significant part of the IP (the first three octets)
  const lookupCache = reactive<{ [ipPrefix: string]: IPLookupResult | null }>({});
  const lookupInProgress = reactive<Set<string>>(new Set());

  const getIpPrefix = (ip: string) => {
    // We assume the first 3 octets are enough for the IP range.
    return ip.split('.').slice(0, 3).join('.');
  };

  const lookupCountry = async (ip: string) => {
    const ipPrefix = getIpPrefix(ip);

    const cached = lookupCache[ipPrefix];

    if (cached?.type === IPLookupResultType.Success || lookupInProgress.has(ipPrefix)) {
      return;
    }

    lookupInProgress.add(ipPrefix);

    try {
      const data = await ipLookupService.lookup(ip);

      if ('error' in data) {
        lookupCache[ipPrefix] = {
          type: IPLookupResultType.Error,
          ...data,
        };
      } else {
        lookupCache[ipPrefix] = {
          type: IPLookupResultType.Success,
          ...data,
        };
      }
    } catch (error) {
      console.error('Failed to lookup IP:', error);
      lookupCache[ipPrefix] = {
        type: IPLookupResultType.Exception,
        error: (error as Error)?.message,
      };
    } finally {
      lookupInProgress.delete(ipPrefix);
    }
  };

  const getLookupResult = (ip: string) => {
    const ipPrefix = getIpPrefix(ip);
    return lookupCache[ipPrefix];
  };

  const isLookupInProgress = (ip: string) => {
    const ipPrefix = getIpPrefix(ip);
    return lookupInProgress.has(ipPrefix);
  };

  return {
    lookupCountry,
    getLookupResult,
    isLookupInProgress,
  };
}
