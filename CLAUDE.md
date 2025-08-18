# Claude Code Development Workflow for Maximum IdP

Maximum IdP は、埼玉大学のプログラミングサークル Maximum のための統一認証基盤・アカウント管理システムです。

## プロジェクト概要

このプロジェクトは、OAuth2.0 認証サーバーとしての機能を持つ IdP (Identity Provider) システムです。

### 技術スタック

- **Frontend**: React 19, React Router v7, Panda CSS, TypeScript
- **Backend**: Hono, Cloudflare Workers, TypeScript
- **Database**: Cloudflare D1 (SQLite), Drizzle ORM
- **開発ツール**: pnpm, Biome, Vite, Wrangler
- **認証**: GitHub OAuth, Discord OAuth, JWT

### アーキテクチャ

```
id/
├── workspaces/
│   ├── client/          # React アプリケーション
│   ├── server/          # Hono API サーバー
│   └── flag/            # フィーチャーフラグ共有パッケージ
├── package.json         # モノレポルート設定
├── biome.json          # 共通コード品質設定
└── pnpm-workspace.yaml # ワークスペース設定
```

## 開発環境セットアップ

### 必要なツール

- Node.js (最新LTS推奨)
- pnpm (package.json で指定されたバージョン)
- Git

### 初期セットアップ

1. **依存関係のインストール**
   ```bash
   pnpm install
   ```

2. **環境変数の設定**
   
   Client:
   ```bash
   cp workspaces/client/.env.example workspaces/client/.env
   ```
   
   Server:
   ```bash
   cp workspaces/server/.dev.vars.example workspaces/server/.dev.vars
   ```
   
   必要な環境変数を `.dev.vars` に設定してください（詳細は README.md 参照）。

3. **データベースマイグレーション**
   ```bash
   pnpm apply:migrations:local
   ```

4. **Server の初回ビルド**
   ```bash
   pnpm -C workspaces/server run build
   ```

### 開発サーバー起動

```bash
pnpm dev
```

これにより、Client と Server が並行して起動します：
- Client: `http://localhost:5173`
- Server: `http://localhost:8787`

## 開発ワークフロー

### コード変更時の手順

1. **新機能/修正の開始**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **開発中の確認**
   - リアルタイムでコードチェック: `pnpm check`
   - 自動修正: `pnpm fix`

3. **Server スキーマ変更時**
   ```bash
   # 新しいマイグレーション生成
   pnpm generate:migrations
   
   # マイグレーション適用
   pnpm apply:migrations:local
   
   # 型定義更新のため Server ビルド
   pnpm -C workspaces/server run build
   ```

### コード品質チェック

プロジェクトでは Biome を使用してコード品質を管理しています。

```bash
# 全ワークスペースのチェック
pnpm check

# 全ワークスペースの自動修正
pnpm fix

# 個別ワークスペースのチェック
pnpm -C workspaces/client run check
pnpm -C workspaces/server run check
```

### テスト実行

現在、プロジェクトに自動テストは設定されていません。手動テストでの確認を行ってください。

### ビルド

```bash
# 全体ビルド
pnpm build

# 個別ビルド
pnpm -C workspaces/client run build
pnpm -C workspaces/server run build
```

## デプロイメント

### Preview 環境

```bash
pnpm deploy:preview
```

### Production 環境

```bash
pnpm deploy:prod
```

## よく使用するコマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm check` | コード品質チェック |
| `pnpm fix` | 自動修正実行 |
| `pnpm build` | 全体ビルド |
| `pnpm seed` | データベースシード実行 |
| `pnpm apply:migrations:local` | ローカル DB マイグレーション |

## ディレクトリ構造の理解

### Client (`workspaces/client/`)

- `app/components/`: React コンポーネント
  - `feature/`: 機能固有のコンポーネント
  - `ui/`: 汎用 UI コンポーネント
  - `logic/`: ビジネスロジックコンポーネント
- `app/routes/`: ページコンポーネント（React Router v7）
- `app/hooks/`: カスタムフック
- `app/repository/`: API 通信ロジック
- `app/types/`: TypeScript 型定義

### Server (`workspaces/server/`)

- `src/routes/`: API エンドポイント
- `src/middleware/`: Hono ミドルウェア
- `src/repository/`: データアクセス層
- `src/infrastructure/`: 外部サービス連携
- `src/db/schema/`: Drizzle スキーマ定義
- `drizzle/`: マイグレーションファイル

## 開発時の注意点

1. **環境変数の管理**
   - `.env` と `.dev.vars` は Git に追跡されません
   - 機密情報を含むため、絶対に公開しないでください

2. **コード規約**
   - Biome の設定に従ってフォーマットされます
   - インデントはタブを使用
   - クォートはダブルクォートを使用

3. **型安全性**
   - TypeScript strict モードを使用
   - Valibot でランタイム検証を実装

4. **DB スキーマ変更**
   - 必ず Drizzle を通してマイグレーションを生成
   - 変更後は Server のビルドを実行して型定義を更新

## トラブルシューティング

### よくある問題

1. **Server の型エラー**
   ```bash
   pnpm -C workspaces/server run build
   ```

2. **DB マイグレーションエラー**
   ```bash
   pnpm apply:migrations:local
   ```

3. **依存関係の問題**
   ```bash
   pnpm install --frozen-lockfile
   ```

### Cron Triggers のテスト

開発サーバー起動後、`http://localhost:8787/dev/cron` にアクセスしてテストできます。

## 関連リンク

- [本番環境](https://id.maximum.vc)
- [OAuth ドキュメント](https://github.com/saitamau-maximum/id/wiki/oauth-docs)
- [機密情報メモ](https://github.com/saitamau-maximum/id/wiki/credentials-memo)

## 更新履歴

- 2025-08-18: Claude Code 用 CLAUDE.md を作成