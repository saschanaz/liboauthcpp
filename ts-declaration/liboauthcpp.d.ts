declare namespace liboauthcpp {
  /** Emscripten Basic */
  interface EmscriptenInstance {
    delete(): void;
    clone(): this;
    isAliasOf(other: any): boolean;
    isDeleted(): boolean;
  }
  interface EmscriptenEnum {
    value: number;
  }

  interface Token {
    key: string;
    secret: string;
  }
  interface TokenConstructor {
    new (key: string, secret: string): Token;
    prototype: Token;
  }
  interface Client {
    getHttpHeader(requestType: HttpRequestType, url: string, data: string, includeOAuthVerifierPin: boolean): string;
    getFormattedHttpHeader(requestType: HttpRequestType, url: string, data: string, includeOAuthVerifierPin: boolean): string;
    getURLQueryString(requestType: HttpRequestType, url: string, data: string, includeOAuthVerifierPin: boolean): string;

    setToken(token: Token): void;
    setCallbackUrl(callbackUrl: string): void;
  }
  interface ClientConstructor {
    new (): Client;
    new (token: Token): Client;
    prototype: Client;
  }

  interface HttpRequestType {
    Invalid: EmscriptenEnum;
    Head: EmscriptenEnum;
    Get: EmscriptenEnum;
    Post: EmscriptenEnum;
    Delete: EmscriptenEnum;
    Put: EmscriptenEnum;
  }
}

interface liboauthcppConstructor {
  Token: liboauthcpp.TokenConstructor;
  Client: liboauthcpp.ClientConstructor;
  HttpRequestType: liboauthcpp.HttpRequestType;
}

declare var _liboauthcpp: liboauthcppConstructor;
