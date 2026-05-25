// 外部プロバイダ (GitHub Org / Discord Guild) に対するロール操作 API 抽象
export interface FetchedExternalRole {
	// プロバイダ側で安定的にロールを識別する文字列。
	// GitHub Team は slug、Discord Role は snowflake。
	externalRoleId: string;
	name: string;
}

export interface IExternalRoleProviderRepository {
	// プロバイダに存在するロール一覧を取得する (validation 用途)
	fetchAvailableRoles(): Promise<FetchedExternalRole[]>;

	/**
	 * 指定ユーザーが現在持っている外部ロールのうち、 candidates に含まれるものを返す。
	 *
	 * candidates を渡す理由: GitHub は「ユーザーが所属する Team 一覧」を取れる
	 * 安価な API がなく、Team ごとに membership を確認する必要がある。
	 * sync で必要なのは管理対象 (config に書かれた externalRoleId) だけなので、
	 * 呼び出し側がスコープを絞ることで無駄な API call を防ぐ。
	 *
	 * - `externalUserId`: GitHub は username (login)、Discord は snowflake
	 */
	fetchUserRoles(
		externalUserId: string,
		candidates: ReadonlySet<string>,
	): Promise<Set<string>>;

	assignRole(externalUserId: string, externalRoleId: string): Promise<void>;
	removeRole(externalUserId: string, externalRoleId: string): Promise<void>;
}
