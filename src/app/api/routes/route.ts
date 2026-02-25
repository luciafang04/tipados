import { NextResponse } from "next/server";
import { createUrbanBusRoute, listUrbanBusRoutes } from "@/lib/urban-bus-store";
import type { CorridorType, UrbanBusRouteInput } from "@/types/bus";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCorridorType = (value: unknown): value is CorridorType =>
  value === "NUM" || value === "H" || value === "V" || value === "D" || value === "X";

const parseRouteInput = (payload: unknown): UrbanBusRouteInput | null => {
  if (!isObject(payload)) {
    return null;
  }

  const { lineCode, corridorType, origin, destination, frequencyMinutes, isAccessible } = payload;
  if (
    typeof lineCode !== "string" ||
    typeof origin !== "string" ||
    typeof destination !== "string" ||
    typeof frequencyMinutes !== "number" ||
    typeof isAccessible !== "boolean" ||
    !isCorridorType(corridorType)
  ) {
    return null;
  }

  if (!Number.isFinite(frequencyMinutes) || frequencyMinutes <= 0) {
    return null;
  }

  return {
    lineCode: lineCode.trim(),
    corridorType,
    origin: origin.trim(),
    destination: destination.trim(),
    frequencyMinutes,
    isAccessible,
  };
};

export async function GET() {
  try {
    const routes = await listUrbanBusRoutes();
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error obteniendo rutas." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    const routeData = parseRouteInput(payload);

    if (routeData === null) {
      return NextResponse.json({ message: "Payload inválido." }, { status: 400 });
    }

    const route = await createUrbanBusRoute(routeData);
    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error creando ruta." },
      { status: 500 },
    );
  }
}
