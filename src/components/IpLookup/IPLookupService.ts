export enum IPLookupResultType {
  Success,
  Exception,
  Error,
}

export interface IPAddressDetails {
  countryCode: string;
  utcOffset: string;
}

export interface IPLookupError {
  error: string;
}

type ResultWithType<ResultType extends IPLookupResultType, Payload extends {}> = {
  type: ResultType;
} & Payload;

export type SuccessResult = ResultWithType<IPLookupResultType.Success, IPAddressDetails>;
export type ErrorResult = ResultWithType<IPLookupResultType.Error, IPLookupError>;
export type ExceptionResult = ResultWithType<IPLookupResultType.Exception, { error: string }>;

export type IPLookupResult = SuccessResult | ErrorResult | ExceptionResult;

export interface IPLookupService {
  lookup(ip: string): Promise<IPAddressDetails | IPLookupError>;
}
