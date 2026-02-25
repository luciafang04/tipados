"use client";

import { useEffect, useState } from "react";
import { UrbanBusForm } from "@/components/urban-bus-form";
import { UrbanBusList } from "@/components/urban-bus-list";
import type { CorridorType, UrbanBusRoute, UrbanBusRouteInput } from "@/types/bus";

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

const parseMessage = async (response: Response): Promise<string | null> => {
  try {
    const payload: unknown = await response.json();
    if (!isObject(payload) || typeof payload.message !== "string") {
      return null;
    }
    return payload.message.trim() === "" ? null : payload.message;
  } catch {
    return null;
  }
};

const readRoutesResponse = async (response: Response): Promise<UrbanBusRoute[] | null> => {
  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isUrbanBusRoute)) {
    return null;
  }
  return payload;
};

const readRouteResponse = async (response: Response): Promise<UrbanBusRoute | null> => {
  const payload: unknown = await response.json();
  return isUrbanBusRoute(payload) ? payload : null;
};

const getResponseMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  const parsed = await parseMessage(response);
  return parsed ?? fallbackMessage;
};

export default function Home() {
  const [routes, setRoutes] = useState<UrbanBusRoute[]>([]);
  const [editingRoute, setEditingRoute] = useState<UrbanBusRoute | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const loadRoutes = async (): Promise<void> => {
      try {
        setErrorMessage("");
        const response = await fetch("/api/routes", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(await getResponseMessage(response, "No se pudieron cargar las líneas."));
        }

        const data = await readRoutesResponse(response);
        if (data === null) {
          throw new Error("La respuesta del servidor no tiene formato válido.");
        }
        setRoutes(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Error cargando datos.");
      }
    };

    void loadRoutes();
  }, []);

  const handleSaveRoute = async (routeData: UrbanBusRouteInput): Promise<boolean> => {
    if (editingRoute !== null) {
      try {
        setErrorMessage("");
        const response = await fetch(`/api/routes/${editingRoute.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(routeData),
        });
        if (!response.ok) {
          throw new Error(await getResponseMessage(response, "No se pudo actualizar la línea."));
        }

        const updatedRoute = await readRouteResponse(response);
        if (updatedRoute === null) {
          throw new Error("La ruta actualizada tiene formato inválido.");
        }
        setRoutes((previousRoutes: UrbanBusRoute[]) =>
          previousRoutes.map((route: UrbanBusRoute) =>
            route.id === updatedRoute.id ? updatedRoute : route,
          ),
        );
        setEditingRoute(null);
        return true;
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Error al guardar cambios.");
        return false;
      }
    }

    try {
      setErrorMessage("");
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      });
      if (!response.ok) {
        throw new Error(await getResponseMessage(response, "No se pudo crear la línea."));
      }

      const createdRoute = await readRouteResponse(response);
      if (createdRoute === null) {
        throw new Error("La ruta creada tiene formato inválido.");
      }
      setRoutes((previousRoutes: UrbanBusRoute[]) => [...previousRoutes, createdRoute]);
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error al crear la línea.");
      return false;
    }
  };

  const handleEditRoute = (id: string): void => {
    const selectedRoute: UrbanBusRoute | undefined = routes.find(
      (route: UrbanBusRoute) => route.id === id,
    );
    setEditingRoute(selectedRoute ?? null);
  };

  const handleDeleteRoute = async (id: string): Promise<void> => {
    try {
      setErrorMessage("");
      const response = await fetch(`/api/routes/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("No se pudo eliminar la línea.");
      }

      setRoutes((previousRoutes: UrbanBusRoute[]) =>
        previousRoutes.filter((route: UrbanBusRoute) => route.id !== id),
      );
      if (editingRoute !== null && editingRoute.id === id) {
        setEditingRoute(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error al eliminar la línea.");
    }
  };

  const handleCancelEdit = (): void => {
    setEditingRoute(null);
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Buses Urbanos de Barcelona</h1>
        <p className="app-subtitle">Gestión de líneas</p>
      </header>

      <section className="layout">
        <div className="panel">
          <h2 className="panel-title">{editingRoute === null ? "Crear línea" : "Editar línea"}</h2>
          {errorMessage !== "" ? <p className="error-message">{errorMessage}</p> : null}
          <UrbanBusForm
            editingRoute={editingRoute}
            key={editingRoute?.id ?? "new"}
            onCancelEdit={handleCancelEdit}
            onSaveRoute={handleSaveRoute}
          />
        </div>

        <div className="panel">
          <h2 className="panel-title">Listado de líneas</h2>
          <UrbanBusList
            onDeleteRoute={handleDeleteRoute}
            onEditRoute={handleEditRoute}
            routes={routes}
          />
        </div>
      </section>
    </main>
  );
}
