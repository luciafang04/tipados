import { NextResponse } from "next/server";
import {
  deleteUrbanBusRoute,
  updateUrbanBusRoute,
} from "@/lib/urban-bus-store";
import type { CorridorType, UrbanBusRouteInput } from "@/types/bus";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const isCorridorType = (value: unknown): value is CorridorType =>
  value === "NUM" || value === "H" || value === "V" || value === "D" || value === "X";

const parseRouteInput = (payload: unknown): UrbanBusRouteInput | null => {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const data = payload as Partial<UrbanBusRouteInput>;
  if (
    typeof data.lineCode !== "string" ||
    typeof data.origin !== "string" ||
    typeof data.destination !== "string" ||
    typeof data.frequencyMinutes !== "number" ||
    typeof data.isAccessible !== "boolean" ||
    !isCorridorType(data.corridorType)
  ) {
    return null;
  }

  const frequencyMinutes = Number(data.frequencyMinutes);
  if (!Number.isFinite(frequencyMinutes) || frequencyMinutes <= 0) {
    return null;
  }

  return {
    lineCode: data.lineCode.trim(),
    corridorType: data.corridorType,
    origin: data.origin.trim(),
    destination: data.destination.trim(),
    frequencyMinutes,
    isAccessible: data.isAccessible,
  };
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const routeData = parseRouteInput(payload);

    if (routeData === null) {
      return NextResponse.json({ message: "Payload invalido." }, { status: 400 });
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
