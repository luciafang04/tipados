"use client";

import { useState } from "react";
import { UrbanBusForm } from "@/components/urban-bus-form";
import { UrbanBusList } from "@/components/urban-bus-list";
import type { UrbanBusRoute, UrbanBusRouteInput } from "@/types/bus";

export default function Home() {
  const [routes, setRoutes] = useState<UrbanBusRoute[]>([]);
  const [editingRoute, setEditingRoute] = useState<UrbanBusRoute | null>(null);

  const handleSaveRoute = (routeData: UrbanBusRouteInput): void => {
    if (editingRoute !== null) {
      setRoutes((previousRoutes: UrbanBusRoute[]) =>
        previousRoutes.map((route: UrbanBusRoute) =>
          route.id === editingRoute.id ? { ...editingRoute, ...routeData } : route,
        ),
      );
      setEditingRoute(null);
      return;
    }

    const newRoute: UrbanBusRoute = {
      id: crypto.randomUUID(),
      ...routeData,
    };

    setRoutes((previousRoutes: UrbanBusRoute[]) => [...previousRoutes, newRoute]);
  };

  const handleEditRoute = (id: string): void => {
    const selectedRoute: UrbanBusRoute | undefined = routes.find(
      (route: UrbanBusRoute) => route.id === id,
    );
    setEditingRoute(selectedRoute ?? null);
  };

  const handleDeleteRoute = (id: string): void => {
    setRoutes((previousRoutes: UrbanBusRoute[]) =>
      previousRoutes.filter((route: UrbanBusRoute) => route.id !== id),
    );

    if (editingRoute !== null && editingRoute.id === id) {
      setEditingRoute(null);
    }
  };

  const handleCancelEdit = (): void => {
    setEditingRoute(null);
  };

  return (
    <main className="app-shell">
      <header>
        <h1>Buses Urbanos de Barcelona</h1>
        <p>Gestión de líneas</p>
      </header>

      <section className="layout">
        <div className="panel">
          <h2>{editingRoute === null ? "Crear línea" : "Editar línea"}</h2>
          <UrbanBusForm
            editingRoute={editingRoute}
            key={editingRoute?.id ?? "new"}
            onCancelEdit={handleCancelEdit}
            onSaveRoute={handleSaveRoute}
          />
        </div>

        <div className="panel">
          <h2>Listado de líneas</h2>
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
