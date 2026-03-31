import { jsonSuccess } from "@/lib/api-response";

type HealthcheckResponse = {
  ok: true;
  now: string;
};

export async function GET() {
  return jsonSuccess<HealthcheckResponse>({
    ok: true,
    now: new Date().toISOString(),
  });
}
