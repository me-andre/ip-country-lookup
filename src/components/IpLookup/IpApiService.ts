import type { IPLookupService } from '@/components/IpLookup/IPLookupService'

interface IpApiResponse {
  country_code: string;
  utc_offset: string;
  error?: true;
  reason?: string;
}

export class IpApiService implements IPLookupService {
  async lookup(ip: string) {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json() as IpApiResponse;

    if (data.error) {
      return {
        error: data.reason as string,
      };
    };

    return {
      countryCode: data.country_code.toLowerCase(),
      utcOffset: data.utc_offset,
    };
  }
}
