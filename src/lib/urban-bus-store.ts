import { kv } from "@vercel/kv";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CorridorType, UrbanBusRoute, UrbanBusRouteInput } from "@/types/bus";

const ROUTES_KEY = "urban-bus-routes";
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_ROUTES_FILE = path.join(LOCAL_DATA_DIR, "urban-bus-routes.local.json");

const hasKvEnv = (): boolean =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCorridorType = (value: unknown): value is CorridorType =>
  value === "NUM" || value === "H" || value === "V" || value === "D" || value === "X";

const isUrbanBusRoute = (value: unknown): value is UrbanBusRoute => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.lineCode === "string" &&
    isCorridorType(value.corridorType) &&
    typeof value.origin === "string" &&
    typeof value.destination === "string" &&
    typeof value.frequencyMinutes === "number" &&
    typeof value.isAccessible === "boolean"
  );
};

const readLocalRoutes = async (): Promise<UrbanBusRoute[]> => {
  try {
    const raw = await readFile(LOCAL_ROUTES_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isUrbanBusRoute);
  } catch {
    return [];
  }
};

const writeLocalRoutes = async (routes: UrbanBusRoute[]): Promise<void> => {
  await mkdir(LOCAL_DATA_DIR, { recursive: true });
  await writeFile(LOCAL_ROUTES_FILE, JSON.stringify(routes, null, 2), "utf8");
};

export const listUrbanBusRoutes = async (): Promise<UrbanBusRoute[]> => {
  if (hasKvEnv()) {
    const routes = await kv.get<UrbanBusRoute[]>(ROUTES_KEY);
    return routes ?? [];
  }

  return readLocalRoutes();
};

export const createUrbanBusRoute = async (
  routeData: UrbanBusRouteInput,
): Promise<UrbanBusRoute> => {
  const routes = await listUrbanBusRoutes();
  const route: UrbanBusRoute = {
    id: crypto.randomUUID(),
    ...routeData,
  };

  const nextRoutes = [...routes, route];
  if (hasKvEnv()) {
    await kv.set(ROUTES_KEY, nextRoutes);
  } else {
    await writeLocalRoutes(nextRoutes);
  }

  return route;
};

export const updateUrbanBusRoute = async (
  id: string,
  routeData: UrbanBusRouteInput,
): Promise<UrbanBusRoute | null> => {
  const routes = await listUrbanBusRoutes();
  const routeIndex = routes.findIndex((route: UrbanBusRoute) => route.id === id);

  if (routeIndex === -1) {
    return null;
  }

  const updatedRoute: UrbanBusRoute = { id, ...routeData };
  const nextRoutes = [...routes];
  nextRoutes[routeIndex] = updatedRoute;

  if (hasKvEnv()) {
    await kv.set(ROUTES_KEY, nextRoutes);
  } else {
    await writeLocalRoutes(nextRoutes);
  }

  return updatedRoute;
};

export const deleteUrbanBusRoute = async (id: string): Promise<boolean> => {
  const routes = await listUrbanBusRoutes();
  const nextRoutes = routes.filter((route: UrbanBusRoute) => route.id !== id);

  if (nextRoutes.length === routes.length) {
    return false;
  }

  if (hasKvEnv()) {
    await kv.set(ROUTES_KEY, nextRoutes);
  } else {
    await writeLocalRoutes(nextRoutes);
  }

  return true;
};
