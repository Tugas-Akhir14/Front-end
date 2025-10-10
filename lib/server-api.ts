import { cookies } from "next/headers";

export async function serverApi(path: string, init: RequestInit = {}) {
  const token = cookies().get("token")?.value;
  const res = await fetch(`http://localhost:8080${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers as any),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstream error ${res.status}`);
  return res.json();
}
