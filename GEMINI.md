# Netlify Function: Marathon Pacer

この関数は、Siri 経由で Apple Watch から送信された自然文（例: "5キロで25分10秒"）をパースし、フルマラソンの目標タイム（例: 4時間）に対して「貯金（リード）」または「借金（ビハインド）」を計算して返します。

## Input

**Method:** `GET`

**Query Parameters:**

- `input` (string, required): ユーザーが音声で入力した自然文（例: `5キロで25分10秒`）
- `km` (string, required): 総走行距離（例: `42.195`）
- `time` (string, required): 目標時間（例: `4_0_0`）

## Example

```
GET /.netlify/functions/pacer?input=5キロで25分10秒&km=42.195&time=4_0_0
```

## Output

**Content-Type:** `application/json`

```json
{
  "status": "success",
  "message": "5キロで25分10秒は、目標より1分50秒の貯金があります"
}
```

または

```json
{
  "status": "success",
  "message": "5キロで27分20秒は、目標より20秒の借金があります"
}
```

## Constraints

- 入力は日本語自然文であること（例: `7キロで35分`, `21キロで1時間45分`）
- inputにおける小数距離には非対応（例: `5.5キロ` は無効）
- サポートする時間単位：
  - 任意：`X時間Y分Z秒`
  - 省略可能：`X分Y秒` / `X分` / `X秒`
- `5キロ25分10秒` のような助詞（「で」）省略スタイルも将来的にサポート可能（拡張予定）

## Notes

- 計算ロジック：
  - 目標タイム（既定値: `4時間 = 14,400秒`）に基づく平均ペース算出（秒/km）
  - 理想通過時間 = 平均ペース × 距離
  - 実際の所要時間との差をもとに、自然文で「貯金」または「借金」を表現
- 日本語での音声応答を想定した応答フォーマット
- 目標タイムを変更したい場合は、将来的に `goal=3:30:00` のような追加パラメータで対応可能

## Runtime

- Platform: Netlify Functions
- Language: TypeScript (ESM)
- Module: `pacer.ts`

