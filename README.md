# Invox technical assignment

Invox社の技術課題

## 仕様

[課題 開発_2412.md]() を参照。元データは [課題 開発_2412.pdf]()。

APIレスポンスの仕様を以下のように補完している。

- レスポンスコードの記述がないため、有効・無効系のHTTPステータスコードは `200-299` を返すものとしている。
- `200-299` 以外のステータスコードは例外をスローし、データベースには記録しないようにしている。

## セットアップ

### `pnpm` のインストール

```bash
npm install -g pnpm@latest-10

# または

brew install pnpm
```

### 依存関係のインストール

```bash
pnpm install
```

### 環境変数の準備

```
cp .env.example .env
```

### データベースのセットアップ

```bash
pnpm run db:setup
```

## テスト

### モックサーバーの起動

```bash
pnpm server:mock
```

### モックサーバーへのテスト送信

```bash
# 成功
pnpm run analyze-image /image/d03f1d36ca69348c51aa/c413eac329e1c0d03/success.jpg

# 失敗
pnpm run analyze-image /image/d03f1d36ca69348c51aa/c413eac329e1c0d03/fail.jpg

# 404エラー
pnpm run analyze-image /image/d03f1d36ca69348c51aa/c413eac329e1c0d03/notexist.jpg

# 500エラー
pnpm run analyze-image /image/d03f1d36ca69348c51aa/c413eac329e1c0d03/server-error.jpg

# タイムアウト
pnpm run analyze-image /image/d03f1d36ca69348c51aa/c413eac329e1c0d03/timeout.jpg
```

## 実サーバーへの送信

```bash
# 環境変数でAPIのURLを指定（データベースに保存されます）
AI_API_BASE_URL=https://api.example.com pnpm run analyze-image /path/to/image.jpg
```

## 自動テスト

### テスト戦略

単体テスト、結合テストに分けて実施。

- 単体テスト: fetchをモックし、レスポンスに応じた処理が出来ていることを確認する
- 結合テスト: モックサーバーを利用し、サーバーへのリクエスト〜DB保存までを確認する

### テストケース

テストケース | ステータスコード | ファイル名 | DB記録
---|---|---|---
成功 | 200 | `/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/success.jpg`|あり
失敗 | 200 | `/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/fail.jpg`|あり
画像が存在しない | 404 | `/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/notexist.jpg`|なし
サーバーエラー | 500 | `/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/server-error.jpg`|なし
タイムアウト | - | `/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/timeout.jpg`|なし

