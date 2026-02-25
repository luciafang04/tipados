"use client";

import type { MouseEvent } from "react";
import type { UrbanBusRoute } from "@/types/bus";

type UrbanBusListProps = {
  routes: UrbanBusRoute[];
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
};

export function UrbanBusList({
  routes,
  onEditRoute,
  onDeleteRoute,
}: UrbanBusListProps) {
  const handleEditClick =
    (id: string) =>
    (e: MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();
      onEditRoute(id);
    };

  const handleDeleteClick =
    (id: string) =>
    (e: MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();
      onDeleteRoute(id);
    };

  if (routes.length === 0) {
    return (
      <p className="empty-state">
        No hay lineas urbanas creadas. Completa el formulario para anadir una.
      </p>
    );
  }

  return (
    <ul className="route-list">
      {routes.map((route: UrbanBusRoute) => (
        <li className="route-card" key={route.id}>
          <p>
            <strong>{route.lineCode}</strong> ({route.corridorType}) - {route.routeName}
          </p>
          <p>
            {route.terminalStart} - {route.terminalEnd}
          </p>
          <p>Frecuencia: {route.frequencyMinutes} min</p>
          <p>{route.isAccessible ? "PMR: Si" : "PMR: No"}</p>
          <div className="button-row">
            <button onClick={handleEditClick(route.id)} type="button">
              Editar
            </button>
            <button className="danger" onClick={handleDeleteClick(route.id)} type="button">
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
