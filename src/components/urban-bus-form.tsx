"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
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
  routeName: string;
  terminalStart: string;
  terminalEnd: string;
  frequencyMinutes: string;
  isAccessible: boolean;
};

const initialFormState: UrbanBusFormState = {
  lineCode: "",
  corridorType: "NUM",
  routeName: "",
  terminalStart: "",
  terminalEnd: "",
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
    routeName: editingRoute.routeName,
    terminalStart: editingRoute.terminalStart,
    terminalEnd: editingRoute.terminalEnd,
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((previousData: UrbanBusFormState) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleAccessibleChange = (checked: boolean | "indeterminate"): void => {
    setFormData((previousData: UrbanBusFormState) => ({
      ...previousData,
      isAccessible: checked === true,
    }));
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
      routeName: formData.routeName.trim(),
      terminalStart: formData.terminalStart.trim(),
      terminalEnd: formData.terminalEnd.trim(),
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
    formData.routeName.trim() === "" ||
    formData.terminalStart.trim() === "" ||
    formData.terminalEnd.trim() === "" ||
    formData.frequencyMinutes.trim() === "";

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <Label.Root htmlFor="lineCode">Numero o codigo de linea</Label.Root>
      <input
        id="lineCode"
        name="lineCode"
        onChange={handleChange}
        placeholder="Ej: 24, H12, V17 o D20"
        type="text"
        value={formData.lineCode}
      />

      <Label.Root htmlFor="corridorType">Tipo de corredor</Label.Root>
      <select
        id="corridorType"
        name="corridorType"
        onChange={handleChange}
        value={formData.corridorType}
      >
        <option value="NUM">Numerica</option>
        <option value="H">Horizontal (H)</option>
        <option value="V">Vertical (V)</option>
        <option value="D">Diagonal (D)</option>
      </select>

      <Label.Root htmlFor="routeName">Nombre de la linea</Label.Root>
      <input
        id="routeName"
        name="routeName"
        onChange={handleChange}
        placeholder="Ej: Passeig de Gracia - Vall d'Hebron"
        type="text"
        value={formData.routeName}
      />

      <Label.Root htmlFor="terminalStart">Cabecera inicial</Label.Root>
      <input
        id="terminalStart"
        name="terminalStart"
        onChange={handleChange}
        type="text"
        value={formData.terminalStart}
      />

      <Label.Root htmlFor="terminalEnd">Cabecera final</Label.Root>
      <input
        id="terminalEnd"
        name="terminalEnd"
        onChange={handleChange}
        type="text"
        value={formData.terminalEnd}
      />

      <Label.Root htmlFor="frequencyMinutes">Frecuencia (min)</Label.Root>
      <input
        id="frequencyMinutes"
        min={1}
        name="frequencyMinutes"
        onChange={handleChange}
        type="number"
        value={formData.frequencyMinutes}
      />

      <div className="checkbox-row">
        <Checkbox.Root
          checked={formData.isAccessible}
          className="radix-checkbox"
          id="isAccessible"
          onCheckedChange={handleAccessibleChange}
        >
          <span className="check-indicator">OK</span>
        </Checkbox.Root>
        <Label.Root htmlFor="isAccessible">Adaptada PMR</Label.Root>
      </div>

      <div className="button-row">
        <button disabled={isSubmitDisabled} type="submit">
          {editingRoute === null ? "Guardar linea" : "Actualizar linea"}
        </button>

        {editingRoute !== null ? (
          <button className="secondary" onClick={handleCancelClick} type="button">
            Cancelar edicion
          </button>
        ) : null}
      </div>
    </form>
  );
}
