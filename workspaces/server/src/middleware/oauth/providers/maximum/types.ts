export type MaximumScope = "read:basic_info";

export type MaximumTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
};

export type MaximumUser = {
  login: string;
};
