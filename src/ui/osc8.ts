const OSC8_PREFIX = "\x1b]8;;";
const OSC8_SUFFIX = "\x1b]8;;\x07";
const BEL = "\x07";

function sanitizeOsc8Value(value: string): string {
  return [...value]
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code !== 7 && code !== 27;
    })
    .join("");
}

export function formatOsc8Hyperlink(url: string, text: string): string {
  const safeUrl = sanitizeOsc8Value(url);
  const safeText = sanitizeOsc8Value(text);
  return `${OSC8_PREFIX}${safeUrl}${BEL}${safeText}${OSC8_SUFFIX}`;
}
