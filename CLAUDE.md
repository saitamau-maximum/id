# CLAUDE.md - Maximum IdP Development Guide

このドキュメントは、Claude Code を使用してMaximum IdPプロジェクトの開発を効率的に行うためのガイドです。

## プロジェクト概要

Maximum IdP は、埼玉大学のプログラミングサークル Maximum のための統一認証基盤・アカウント管理システムです。OAuth2.0 認証サーバーとしての機能を持ち、他のMaximumサービスに対してIdPを利用した認証を提供します。

### アーキテクチャ

- **モノレポ構成**: pnpm workspace を使用
- **Client**: React 19 + React Router v7 (SSR対応)
- **Server**: Hono + Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **UI**: Panda CSS + React Aria Components
- **Code Quality**: Biome (Linter + Formatter)

## 技術スタック

### Client (workspaces/client)
- React 19 + React Router v7
- TypeScript
- Panda CSS (CSS-in-JS)
- React Aria Components
- TanStack Query
- React Hook Form + Valibot
- Chart.js (データ可視化)

### Server (workspaces/server)
- Hono (Web フレームワーク)
- Cloudflare Workers (ランタイム)
- Drizzle ORM + Cloudflare D1
- TypeScript
- Valibot (バリデーション)

###共通ツール
- pnpm (パッケージマネージャー)
- Biome (リンター・フォーマッター)
- TypeScript

## 開発環境セットアップ

### 前提条件
- Node.js (バージョンは `.node-version` を参照)
- pnpm (package.jsonに指定されたバージョン)

### 初期セットアップ

1. **依存関係のインストール**
   ```bash
   pnpm install
   ```

2. **環境変数の設定**
   
   Client側:
   ```bash
   cp workspaces/client/.env.example workspaces/client/.env
   ```
   
   Server側:
   ```bash
   cp workspaces/server/.dev.vars.example workspaces/server/.dev.vars
   ```
   
   必要な環境変数については README.md を参照してください。

3. **データベースのマイグレーション**
   ```bash
   pnpm apply:migrations:local
   ```

4. **Server側の型生成**
   ```bash
   pnpm -C workspaces/server run build
   ```

## 開発ワークフロー

### 開発サーバーの起動
```bash
pnpm dev
```
- Client: http://localhost:5173
- Server: http://localhost:8787

### コード品質チェック
```bash
# 全体のリント・フォーマット
pnpm check

# 自動修正
pnpm fix

# 型チェック
pnpm -C workspaces/client run typecheck
```

### ビルド
```bash
# 全体のビルド
pnpm build

# 個別ビルド
pnpm -C workspaces/client run build
pnpm -C workspaces/server run build
```

### データベース操作
```bash
# マイグレーション生成
pnpm generate:migrations

# マイグレーション適用（ローカル）
pnpm apply:migrations:local

# シード実行
pnpm seed
```

## よく使用するコマンド

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動（Client + Server） |
| `pnpm build` | 全体ビルド |
| `pnpm check` | リンター・型チェック実行 |
| `pnpm fix` | リンター自動修正 |
| `pnpm seed` | データベースシード |
| `pnpm apply:migrations:local` | ローカルマイグレーション |
| `pnpm generate:migrations` | マイグレーションファイル生成 |

## ディレクトリ構造

```
/
├── workspaces/
│   ├── client/          # React フロントエンド
│   │   ├── app/         # アプリケーションコード
│   │   │   ├── components/  # UI コンポーネント
│   │   │   ├── routes/      # ページコンポーネント
│   │   │   ├── hooks/       # カスタムフック
│   │   │   └── repository/  # API クライアント
│   │   └── public/      # 静的ファイル
│   ├── server/          # Hono バックエンド
│   │   ├── src/
│   │   │   ├── routes/      # API エンドポイント
│   │   │   ├── db/          # データベーススキーマ・シード
│   │   │   ├── middleware/  # ミドルウェア
│   │   │   └── repository/  # データアクセス層
│   │   └── drizzle/     # マイグレーションファイル
│   └── flag/            # フィーチャーフラグ
├── package.json         # ルートパッケージ設定
├── pnpm-workspace.yaml  # ワークスペース設定
└── biome.json          # コード品質設定
```

## 開発時の注意点

### 環境変数
- 機密情報は `.env` や `.dev.vars` に設定（Git管理対象外）
- 公開情報は `wrangler.toml` に設定

### データベース
- スキーマ変更時は必ずマイグレーションファイルを生成
- Server側の型変更後は Client 側でビルドを実行

### コード品質
- コミット前に `pnpm check` を実行
- Biome の設定に従ってコードを記述
- TypeScript の型安全性を重視

## トラブルシューティング

### よくある問題

1. **型エラーが発生する場合**
   ```bash
   # Server側をビルドして型を生成
   pnpm -C workspaces/server run build
   ```

2. **マイグレーションエラー**
   ```bash
   # ローカルデータベースをリセット
   rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject/
   pnpm apply:migrations:local
   ```

3. **依存関係の問題**
   ```bash
   # node_modules を削除して再インストール
   rm -rf node_modules workspaces/*/node_modules
   pnpm install
   ```

4. **開発サーバーが起動しない**
   - 環境変数の設定を確認
   - ポートの競合を確認（5173, 8787）

### デバッグ

- Client: React Developer Tools を使用
- Server: Wrangler の開発モードでログ確認
- Database: Drizzle Studio（`npx drizzle-kit studio`）

## Claude Code 使用時のヒント

1. **ファイル検索時**: Glob ツールを使用してパターンマッチ
2. **コード変更時**: 関連する型定義ファイルも確認
3. **新機能実装時**: 既存のコンポーネント・パターンを参考に
4. **API変更時**: Client と Server 両方の型安全性を確保
5. **テスト**: 関連するテストファイルも同時に更新

## リンク
- [本番環境](https://id.maximum.vc)
- [GitHub リポジトリ](https://github.com/saitamau-maximum/id)
- [Wiki（OAuth ドキュメント）](https://github.com/saitamau-maximum/id/wiki/oauth-docs)