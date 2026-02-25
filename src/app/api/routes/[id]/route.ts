import { NextResponse } from "next/server";
import { deleteUrbanBusRoute, updateUrbanBusRoute } from "@/lib/urban-bus-store";
import type { CorridorType, UrbanBusRouteInput } from "@/types/bus";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload: unknown = await request.json();
    const routeData = parseRouteInput(payload);

    if (routeData === null) {
      return NextResponse.json({ message: "Payload inválido." }, { status: 400 });
    }

    const updatedRoute = await updateUrbanBusRoute(id, routeData);
    if (updatedRoute === null) {
      return NextResponse.json({ message: "Ruta no encontrada." }, { status: 404 });
    }

    return NextResponse.json(updatedRoute);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error actualizando ruta." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteUrbanBusRoute(id);
    if (!deleted) {
      return NextResponse.json({ message: "Ruta no encontrada." }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error eliminando ruta." },
      { status: 500 },
    );
  }
}
