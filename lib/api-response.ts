import { NextResponse } from "next/server";

export type ApiErrorResponse = {
  error: string;
};

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json<T>(data, { status });
}

export function jsonError(message: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error: message }, { status });
}
