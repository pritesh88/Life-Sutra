import { randomInt } from "node:crypto";

export const BASE_URL = process.env["TEST_BASE_URL"] ?? "http://localhost:3100";

// The server under test is a production build, so cookies carry the __Host- prefix.
export const SESSION_COOKIE = "__Host-life_sutra_session";
export const CSRF_COOKIE = "__Host-life_sutra_csrf";

export type CookieInfo = {
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string | undefined;
  path: string | undefined;
  maxAge: number | undefined;
  domain: string | undefined;
  raw: string;
};

export function parseSetCookie(raw: string): { name: string; info: CookieInfo } {
  const [pair = "", ...attrs] = raw.split(";").map((part) => part.trim());
  const eq = pair.indexOf("=");
  const name = pair.slice(0, eq);
  const value = pair.slice(eq + 1);
  const lower = attrs.map((a) => a.toLowerCase());
  const attr = (key: string) =>
    attrs.find((a) => a.toLowerCase().startsWith(`${key}=`))?.split("=")[1];
  const maxAge = attr("max-age");
  return {
    name,
    info: {
      value,
      httpOnly: lower.includes("httponly"),
      secure: lower.includes("secure"),
      sameSite: attr("samesite")?.toLowerCase(),
      path: attr("path"),
      maxAge: maxAge === undefined ? undefined : Number(maxAge),
      domain: attr("domain"),
      raw,
    },
  };
}

export type Res = {
  status: number;
  headers: Headers;
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  text: string;
  setCookies: Map<string, CookieInfo>;
};

export const randomIp = () => `10.${randomInt(1, 250)}.${randomInt(1, 250)}.${randomInt(1, 250)}`;

/**
 * A tiny browser stand-in: keeps a cookie jar, sends a stable client IP via
 * X-Forwarded-For (the server under test trusts one proxy hop), and can fetch
 * a CSRF token the same way the real UI does.
 */
export class Client {
  readonly jar = new Map<string, string>();
  /** Everything this "browser" has ever been sent: URL + status + headers + body. Used for leak scans. */
  readonly history: { path: string; res: Res }[] = [];
  constructor(readonly ip: string = randomIp()) {}

  cookie(name: string) {
    return this.jar.get(name);
  }

  setCookie(name: string, value: string) {
    this.jar.set(name, value);
  }

  clearCookie(name: string) {
    this.jar.delete(name);
  }

  async raw(
    path: string,
    init: { method?: string; headers?: Record<string, string>; body?: string } = {},
  ): Promise<Res> {
    const headers: Record<string, string> = { "x-forwarded-for": this.ip, ...init.headers };
    if (this.jar.size > 0)
      headers["cookie"] = [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
    const response = await fetch(`${BASE_URL}${path}`, {
      method: init.method ?? "GET",
      headers,
      ...(init.body !== undefined ? { body: init.body } : {}),
      redirect: "manual",
    });
    const setCookies = new Map<string, CookieInfo>();
    for (const line of response.headers.getSetCookie()) {
      const { name, info } = parseSetCookie(line);
      setCookies.set(name, info);
      if (info.value === "" || info.maxAge === 0) this.jar.delete(name);
      else this.jar.set(name, info.value);
    }
    const text = await response.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* non-JSON (HTML page) */
    }
    const res: Res = { status: response.status, headers: response.headers, body, text, setCookies };
    this.history.push({ path, res });
    return res;
  }

  /** All text this client has received or requested — paths, headers, cookies and bodies. */
  transcript() {
    return this.history
      .map(({ path, res }) =>
        [path, ...[...res.headers].map(([k, v]) => `${k}: ${v}`), res.text].join("\n"),
      )
      .join("\n----\n");
  }

  /** Only what the server sent back (headers + bodies), not what this client asked for. */
  received() {
    return this.history
      .map(({ res }) => [...[...res.headers].map(([k, v]) => `${k}: ${v}`), res.text].join("\n"))
      .join("\n----\n");
  }

  /** Establishes the CSRF cookie (like the UI does) and returns the token. */
  async csrf() {
    await this.raw("/api/auth/csrf");
    const token = this.jar.get(CSRF_COOKIE);
    if (!token) throw new Error("no CSRF cookie was set");
    return token;
  }

  get(path: string, headers: Record<string, string> = {}) {
    return this.raw(path, { headers });
  }

  private async send(
    method: string,
    path: string,
    body?: unknown,
    headers: Record<string, string> = {},
  ) {
    const token = await this.csrf();
    return this.raw(path, {
      method,
      headers: { "content-type": "application/json", "x-csrf-token": token, ...headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  }

  post(path: string, body?: unknown, headers?: Record<string, string>) {
    return this.send("POST", path, body, headers);
  }
  patch(path: string, body?: unknown, headers?: Record<string, string>) {
    return this.send("PATCH", path, body, headers);
  }
  put(path: string, body?: unknown, headers?: Record<string, string>) {
    return this.send("PUT", path, body, headers);
  }
  delete(path: string, headers?: Record<string, string>) {
    return this.send("DELETE", path, undefined, headers);
  }

  async login(email: string, password: string) {
    return this.post("/api/auth/login", { email, password });
  }
}
