// 外部プロバイダ (GitHub Org / Discord Guild) からのロール取得 API 抽象
export interface FetchedExternalRole {
	// プロバイダ側で安定的にロールを識別する文字列。
	// GitHub Team は slug、Discord Role は snowflake。
	externalRoleId: string;
	name: string;
}

export interface IExternalRoleProviderRepository {
	fetchAvailableRoles(): Promise<FetchedExternalRole[]>;
}
