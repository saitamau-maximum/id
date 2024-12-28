export type MaximumScope = "read:basic_info";

export type MaximumTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
};

export type MaximumTokenVerifyResponse = {
  valid: boolean;
  client: {
    id: string;
    name: string;
    description: string;
    logo_url: string | null;
    owner_id: string;
  };
  user_id: string;
  expires_at: string;
  scopes: string[];
  user_info: MaximumUser;
};

export type MaximumUser = {
  id: string;
  display_name: string;
  profile_image_url: string;
};
