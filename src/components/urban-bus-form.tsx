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
  onSaveRoute: (routeData: UrbanBusRouteInput) => Promise<boolean>;
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

const corridorOptions: Array<{ value: CorridorType; label: string }> = [
  { value: "NUM", label: "Numérica" },
  { value: "H", label: "Horizontal" },
  { value: "V", label: "Vertical" },
  { value: "D", label: "Diagonal" },
  { value: "X", label: "Exprés" },
];

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

  const setTextField = (
    field: Exclude<keyof UrbanBusFormState, "isAccessible">,
    value: string,
  ): void => {
    setFormData((previousData: UrbanBusFormState) => ({
      ...previousData,
      [field]: value,
    }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, type } = e.target;

    if (type === "checkbox") {
      if (name !== "isAccessible") {
        return;
      }

      setFormData((previousData: UrbanBusFormState) => ({
        ...previousData,
        isAccessible: e.target.checked,
      }));
      return;
    }

    if (name === "isAccessible") {
      return;
    }

    setTextField(name as Exclude<keyof UrbanBusFormState, "isAccessible">, e.target.value);
  };

  const handleInfoClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setShowPmrInfo((previousValue: boolean) => !previousValue);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const parsedFrequency: number = Number(formData.frequencyMinutes);
    if (Number.isNaN(parsedFrequency) || parsedFrequency <= 0) {
      return;
    }

    const wasSaved = await onSaveRoute({
      lineCode: formData.lineCode.trim(),
      corridorType: formData.corridorType,
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      frequencyMinutes: parsedFrequency,
      isAccessible: formData.isAccessible,
    });

    if (wasSaved && editingRoute === null) {
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
      <Label.Root htmlFor="lineCode">Número o código de línea:</Label.Root>
      <input
        className="line-field"
        id="lineCode"
        name="lineCode"
        onChange={handleInputChange}
        placeholder="Ej: 24, H12, V17 o D20"
        type="text"
        value={formData.lineCode}
      />

      <fieldset className="radio-group">
        <legend>Tipo de bus</legend>
        {corridorOptions.map((option: { value: CorridorType; label: string }) => (
          <label className="radio-option" key={option.value}>
            <input
              checked={formData.corridorType === option.value}
              name="corridorType"
              onChange={handleInputChange}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <Label.Root htmlFor="origin">Origen:</Label.Root>
      <input
        className="line-field"
        id="origin"
        name="origin"
        onChange={handleInputChange}
        placeholder="Ej: Pl. Catalunya"
        type="text"
        value={formData.origin}
      />

      <Label.Root htmlFor="destination">Final</Label.Root>
      <input
        className="line-field"
        id="destination"
        name="destination"
        onChange={handleInputChange}
        placeholder="Ej: Pl. Espanya"
        type="text"
        value={formData.destination}
      />

      <Label.Root htmlFor="frequencyMinutes">Frecuencia (min)</Label.Root>
      <input
        className="line-field"
        id="frequencyMinutes"
        min={1}
        name="frequencyMinutes"
        onChange={handleInputChange}
        placeholder="10"
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
          aria-label="Mostrar información de PMR"
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
        <button className="ghost-button" disabled={isSubmitDisabled} type="submit">
          {editingRoute === null ? "Guardar línea" : "Actualizar línea"}
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
