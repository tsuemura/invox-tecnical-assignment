import { AiAnalysisService } from '../src/ai-analysis.service';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('エラー: 画像パスを指定してください');
    console.error('使用法: pnpm run analyze-image <画像パス>');
    console.error(
      '例: pnpm run analyze-image /image/d03f1d36ca69348c51aa/c413eac329e1c0d03/success.jpg',
    );
    process.exit(1);
  }

  const imagePath = args[0];

  const service = new AiAnalysisService();

  console.log(`\n画像解析リクエストを送信中...`);
  console.log(
    `API URL: ${process.env.AI_API_BASE_URL || 'http://localhost:3001'}`,
  );
  console.log(`画像パス: ${imagePath}\n`);

  try {
    const result = await service.analyzeImage(imagePath);
    console.log('解析結果（DBに保存済み）:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('エラーが発生しました:');
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

void main();
