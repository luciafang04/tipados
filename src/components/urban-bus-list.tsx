"use client";

import type { MouseEvent } from "react";
import type { CorridorType, UrbanBusRoute } from "@/types/bus";

type UrbanBusListProps = {
  routes: UrbanBusRoute[];
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
};

const corridorClassByType: Record<CorridorType, string> = {
  NUM: "route-card-num",
  H: "route-card-h",
  V: "route-card-v",
  D: "route-card-d",
  X: "route-card-x",
};

const corridorBgByType: Record<CorridorType, string> = {
  NUM: "#fee2e2",
  H: "#dbeafe",
  V: "#dcfce7",
  D: "#f3e8ff",
  X: "#e5e7eb",
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
        No hay líneas urbanas creadas. Completa el formulario para añadir una.
      </p>
    );
  }

  return (
    <ul className="route-list">
      {routes.map((route: UrbanBusRoute) => (
        <li
          className={`route-card ${corridorClassByType[route.corridorType]}`}
          key={route.id}
          style={{ backgroundColor: corridorBgByType[route.corridorType] }}
        >
          <p>
            <strong>{route.lineCode}</strong> ({route.corridorType})
          </p>
          <p>
            {route.origin} - {route.destination}
          </p>
          <p>Frecuencia: {route.frequencyMinutes} min</p>
          <p>{route.isAccessible ? "PMR: Sí" : "PMR: No"}</p>
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
