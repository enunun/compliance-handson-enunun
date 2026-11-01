import { raw } from "hono/html";

export function Comment({ text }: { text: string }) {
  return (
    <p>
      {text}
      {raw("<hr>")}
    </p>
  );
}
