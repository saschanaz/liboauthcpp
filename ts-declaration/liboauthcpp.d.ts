/** Emscripten Basic */
declare module Module {
  class EmscriptenClass {
    delete(): void;
    clone(): any; // this;
    isAliasOf(other: any): boolean;
    isDeleted(): boolean;
  }
  interface EmscriptenEnum {
    value: number;
  }
}

declare module Module {
  class Token extends EmscriptenClass {
    key: string;
    secret: string;

    constructor(key: string, secret: string);
  }
  class Client extends EmscriptenClass {
    constructor();
    constructor(token: Token);
    
    getHttpHeader(requestType: HttpRequestType, url: string, data: string, includeOAuthVerifierPin: boolean): string;
    getFormattedHttpHeader(requestType: HttpRequestType, url: string, data: string, includeOAuthVerifierPin: boolean): string;
    getURLQueryString(requestType: HttpRequestType, url: string, data: string, includeOAuthVerifierPin: boolean): string;

    setToken(token: Token): void;
    setCallbackUrl(callbackUrl: string): void;
  }
  interface HttpRequestType extends EmscriptenEnum { }
  module HttpRequestType {
    var Invalid: EmscriptenEnum;
    var Head: EmscriptenEnum;
    var Get: EmscriptenEnum;
    var Post: EmscriptenEnum;
    var Delete: EmscriptenEnum;
    var Put: EmscriptenEnum;
  }
}