const FIXER_URL = "https://data.fixer.io/api";
export const DEFAULT_SUPPORTED_SYMBOLS = ["HUF", "EUR", "USD", "GBP"];

export const fetchRates = async (apiKey) => {
  const url = `${FIXER_URL}/latest?access_key=${apiKey}&symbols=${DEFAULT_SUPPORTED_SYMBOLS.join(",")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fixer hiba: ${res.status}`);
  const data = await res.json();
  if (!data?.rates || !data.rates.HUF) throw new Error("Hiányzó HUF árfolyam");

  const eurToHuf = data.rates.HUF; // HUF -> EUR
  const usdToEur = data.rates.USD || 1; // USD -> EUR
  const gbpToEur = data.rates.GBP || 1; // GBP -> EUR

  const rates = {
    HUF: 1,
    EUR: eurToHuf, // 1 EUR -> HUF
    USD: eurToHuf / usdToEur, // 1 USD -> HUF
    GBP: eurToHuf / gbpToEur, // 1 GBP -> HUF
  };

  return { base: "HUF", rates };
};
