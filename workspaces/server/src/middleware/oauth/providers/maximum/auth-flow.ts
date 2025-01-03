import { toQueryParams } from "../../utils/object-to-query";
import type {
  MaximumScope,
  MaximumTokenResponse,
  MaximumTokenVerifyResponse,
  MaximumUser,
} from "./types";

type MaximumAuthFlow = {
  client_id: string;
  client_secret: string;
  scope?: MaximumScope[];
  state: string;
  code: string | undefined;
};

type Token = {
  token: string;
  expires_in?: number;
};

const userAgent = "Hono-Auth-App";
const BASE_OAUTH_URL = "https://auth.maximum.vc/oauth";

export class AuthFlow {
  client_id: string;
  client_secret: string;
  scope: MaximumScope[] | undefined;
  state: string;
  code: string | undefined;
  token: Token | undefined;
  user: Partial<MaximumUser> | undefined;
  granted_scopes: string[] | undefined;

  constructor({
    client_id,
    client_secret,
    scope,
    state,
    code,
  }: MaximumAuthFlow) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.scope = scope;
    this.state = state;
    this.code = code;
    this.token = undefined;
    this.user = undefined;
    this.granted_scopes = undefined;
  }

  redirect() {
    const url = `${BASE_OAUTH_URL}/authorize?`;

    const queryParams = toQueryParams({
      client_id: this.client_id,
      state: this.state,
      response_type: "code", // Maximum AuthはCode Flowのみ
      scope: this.scope?.join(" ") || "",
    });

    return url.concat(queryParams);
  }

  private async getTokenFromCode() {
    if (!this.code) {
      throw new Error("Code is required to get the token");
    }

    const formData = new FormData();
    formData.append("client_id", this.client_id);
    formData.append("client_secret", this.client_secret);
    formData.append("code", this.code);
    formData.append("grant_type", "authorization_code"); // Maximum AuthはCode Flowのみ

    const response = (await fetch(`${BASE_OAUTH_URL}/access-token`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())) as MaximumTokenResponse;

    if ("access_token" in response) {
      this.token = {
        token: response.access_token,
        expires_in: response.expires_in,
      };
      this.granted_scopes = response.scope.split(",");
    }
  }

  async getUserData() {
    if (!this.token?.token) {
      await this.getTokenFromCode();
    }

    const response = (await fetch(`${BASE_OAUTH_URL}/verify-token`, {
      headers: {
        Authorization: `Bearer ${this.token?.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
    }).then((res) => res.json())) as MaximumTokenVerifyResponse;

    if (response.valid) {
      this.user = response.user_info;
    }
  }
}
