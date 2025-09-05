# Invox technical assignment

Invox社の技術課題

## 仕様

[課題 開発_2412.md]() を参照。元データは [課題 開発_2412.pdf]()。

APIレスポンスの仕様を以下のように補完している。

- レスポンスコードの記述がないため、有効・無効系のHTTPステータスコードは `200-299` を返すものとしている。
- `200-299` 以外のステータスコードは例外をスローし、データベースには記録しないようにしている。
-

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

### データベースのセットアップ

```bash
pnpm run db:setup
```


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

## テスト

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


## 技術スタック

- WAF: `NestJS`
- ORM: `Prisma`
- DB: `SQLite`


## 備考

- `Python、Java、JavaScript、PHPのいずれかの言語でフレームワークを利用してください` という要件から、フルスタックWebアプリケーションフレームワークでの開発能力を見たいのではと考え、[NestJS](https://nestjs.com/)を利用した。JS/TSだと他に[Blitz.js](https://blitzjs.com/)なども考えられる。ただ単に実装するだけなら[Bun](https://bun.com/)の組み込みライブラリだけで組んだほうが早い。
- `TypeORM`ではなく`Prisma`にしたのはただの好みだが、前者は[一時期存続が危ぶまれていた](https://scrapbox.io/uki00a/TypeORM%E3%81%AE%E7%8F%BE%E5%9C%A8%E3%81%AE%E5%8B%95%E5%90%91%E3%81%A8%E4%BB%8A%E5%BE%8C%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6_(2024%E5%B9%B4))との話もあるらしい。
- 採点の簡単さを優先し、データベースには`SQLite`を使っている。
