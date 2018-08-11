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

  interface Token extends EmscriptenInstance {
    key: string;
    secret: string;
  }
  interface TokenConstructor {
    new (key: string, secret: string): Token;
    prototype: Token;
  }
  interface Client extends EmscriptenInstance {
    getHttpHeader(requestType: EmscriptenEnum, url: string, data: string, includeOAuthVerifierPin: boolean): string;
    getFormattedHttpHeader(requestType: EmscriptenEnum, url: string, data: string, includeOAuthVerifierPin: boolean): string;
    getURLQueryString(requestType: EmscriptenEnum, url: string, data: string, includeOAuthVerifierPin: boolean): string;

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

interface liboauthcpp {
  Token: liboauthcpp.TokenConstructor;
  Client: liboauthcpp.ClientConstructor;
  HttpRequestType: liboauthcpp.HttpRequestType;
  then(callback: (module: liboauthcpp) => any): any;
}

interface liboauthcppFactory {
  (): liboauthcpp
}

declare var _liboauthcpp: liboauthcppFactory;
