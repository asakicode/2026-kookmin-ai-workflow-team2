const girlfriendFallbacks: Record<string, string> = {
  gf_minseo: "??吏湲?萸먮씪怨??댁빞 ?좎? 紐⑤Ⅴ寃좎뼱.",
  gf_jiyoon: "?좉퉸 ?앷컖 醫 ?좉쾶.",
  gf_seoa: "吏湲덉? 留먯씠 ?????섏?.",
  gf_harin: "???섍린??議곌툑 ?덈떎媛 ?ㅼ떆 ?섏옄."
};

const defaultGirlfriendFallback = "?좉퉸留? 吏湲덉? 諛붾줈 ?듯븯湲??대졄寃좎뼱.";

const dailyFeedbackFallback =
  "?ㅻ뒛???쇰뱶諛? ?곷???媛먯젙 ?곹깭? ?듭옣 ??대컢??以묒슂?덉뒿?덈떎. ?ㅼ쓬?먮뒗 ?섎뱺 ?댁빞湲곕? 爰쇰깉????癒쇱? 怨듦컧?섍퀬, ?꾩슂??寃쎌슦 吏㏐쾶?쇰룄 鍮좊Ⅴ寃?諛섏쓳?섎뒗 ?몄씠 醫뗭뒿?덈떎.";

export function getGirlfriendFallbackReply(girlfriendId?: string): string {
  if (!girlfriendId) {
    return defaultGirlfriendFallback;
  }

  return girlfriendFallbacks[girlfriendId] ?? defaultGirlfriendFallback;
}

export function getDailyFeedbackFallback(): string {
  return dailyFeedbackFallback;
}

export function getIntentFallback(): {
  intent: "UNKNOWN";
  confidence: 0;
  reason: string;
} {
  return {
    intent: "UNKNOWN",
    confidence: 0,
    reason: "遺꾨쪟???ㅽ뙣?덉뒿?덈떎."
  };
}
