import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ① [방어] 환경변수 누락 시 즉시 500 반환 (early return)
  const GAS_URL = process.env.VITE_GAS_URL || process.env.GAS_URL;
  const API_SECRET = process.env.VITE_API_SECRET || process.env.API_SECRET;
  
  if (!GAS_URL || !API_SECRET) {
    return res.status(500).json({ error: "Internal Server Error: Missing environment variables" });
  }

  try {
    // ② [방어] action은 서버가 req.method로 결정한다. 클라이언트 body의 action/secret 무시
    let payload: Record<string, any> = {};
    
    if (req.method === 'GET') {
      // ③ [방어] GET 요청 → action: 'read' + secret만 GAS에 전송
      payload = { action: 'read', secret: API_SECRET };
    } else if (req.method === 'POST') {
      // ③ [방어] 클라이언트 body에서 action과 secret 필드는 반드시 제거 후 병합
      const { action, secret, ...safeBody } = req.body || {};
      payload = {
        action: 'write',
        secret: API_SECRET,
        ...safeBody
      };
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
