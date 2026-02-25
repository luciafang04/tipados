"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import * as Label from "@radix-ui/react-label";
import type {
  CorridorType,
  UrbanBusRoute,
  UrbanBusRouteInput,
} from "@/types/bus";

type UrbanBusFormProps = {
  editingRoute: UrbanBusRoute | null;
  onSaveRoute: (routeData: UrbanBusRouteInput) => void;
  onCancelEdit: () => void;
};

type UrbanBusFormState = {
  lineCode: string;
  corridorType: CorridorType;
  origin: string;
  destination: string;
  frequencyMinutes: string;
  isAccessible: boolean;
};

const initialFormState: UrbanBusFormState = {
  lineCode: "",
  corridorType: "NUM",
  origin: "",
  destination: "",
  frequencyMinutes: "",
  isAccessible: false,
};

const mapRouteToFormState = (
  editingRoute: UrbanBusRoute | null,
): UrbanBusFormState => {
  if (editingRoute === null) {
    return initialFormState;
  }

  return {
    lineCode: editingRoute.lineCode,
    corridorType: editingRoute.corridorType,
    origin: editingRoute.origin,
    destination: editingRoute.destination,
    frequencyMinutes: String(editingRoute.frequencyMinutes),
    isAccessible: editingRoute.isAccessible,
  };
};

export function UrbanBusForm({
  editingRoute,
  onSaveRoute,
  onCancelEdit,
}: UrbanBusFormProps) {
  const [formData, setFormData] = useState<UrbanBusFormState>(() =>
    mapRouteToFormState(editingRoute),
  );
  const [showPmrInfo, setShowPmrInfo] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((previousData: UrbanBusFormState) => ({
        ...previousData,
        [name]: e.target.checked,
      }));
      return;
    }

    setFormData((previousData: UrbanBusFormState) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((previousData: UrbanBusFormState) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleInfoClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setShowPmrInfo((previousValue: boolean) => !previousValue);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const parsedFrequency: number = Number(formData.frequencyMinutes);
    if (Number.isNaN(parsedFrequency) || parsedFrequency <= 0) {
      return;
    }

    onSaveRoute({
      lineCode: formData.lineCode.trim(),
      corridorType: formData.corridorType,
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      frequencyMinutes: parsedFrequency,
      isAccessible: formData.isAccessible,
    });

    if (editingRoute === null) {
      setFormData(initialFormState);
    }
  };

  const handleCancelClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    onCancelEdit();
  };

  const isSubmitDisabled: boolean =
    formData.lineCode.trim() === "" ||
    formData.origin.trim() === "" ||
    formData.destination.trim() === "" ||
    formData.frequencyMinutes.trim() === "";

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <Label.Root htmlFor="lineCode">Número o código de línea</Label.Root>
      <input
        id="lineCode"
        name="lineCode"
        onChange={handleInputChange}
        placeholder="Ej: 24, H12, V17 o D20"
        type="text"
        value={formData.lineCode}
      />

      <Label.Root htmlFor="corridorType">Tipo de bus</Label.Root>
      <select
        id="corridorType"
        name="corridorType"
        onChange={handleSelectChange}
        value={formData.corridorType}
      >
        <option value="NUM">Numérica</option>
        <option value="H">Horizontal</option>
        <option value="V">Vertical</option>
        <option value="D">Diagonal</option>
        <option value="X">Express</option>

      </select>

      <Label.Root htmlFor="origin">Origen</Label.Root>
      <input
        id="origin"
        name="origin"
        onChange={handleInputChange}
        placeholder="Ej: Pl. Catalunya"
        type="text"
        value={formData.origin}
      />

      <Label.Root htmlFor="destination">Final</Label.Root>
      <input
        id="destination"
        name="destination"
        onChange={handleInputChange}
        type="text"
        value={formData.destination}
      />

      <Label.Root htmlFor="frequencyMinutes">Frecuéncia (min)</Label.Root>
      <input
        id="frequencyMinutes"
        min={1}
        name="frequencyMinutes"
        onChange={handleInputChange}
        type="number"
        value={formData.frequencyMinutes}
      />

      <div className="checkbox-row">
        <input
          checked={formData.isAccessible}
          id="isAccessible"
          name="isAccessible"
          onChange={handleInputChange}
          type="checkbox"
        />
        <Label.Root htmlFor="isAccessible">Adaptada PMR</Label.Root>
        <button
          aria-expanded={showPmrInfo}
          aria-label="Mostrar informacion de PMR"
          className="info-button"
          onClick={handleInfoClick}
          type="button"
        >
          i
        </button>
      </div>
      {showPmrInfo ? (
        <p className="pmr-help">Personas con Movilidad Reducida</p>
      ) : null}

      <div className="button-row">
        <button disabled={isSubmitDisabled} type="submit">
          {editingRoute === null ? "Guardar linea" : "Actualizar linea"}
        </button>

        {editingRoute !== null ? (
          <button className="secondary" onClick={handleCancelClick} type="button">
            Cancelar edición
          </button>
        ) : null}
      </div>
    </form>
  );
}
