export type CorridorType = "NUM" | "H" | "V" | "D" | "X";

export type UrbanBusRoute = {
  id: string;
  lineCode: string;
  corridorType: CorridorType;
  origin: string;
  destination: string;
  frequencyMinutes: number;
  isAccessible: boolean;
};

export type UrbanBusRouteInput = Omit<UrbanBusRoute, "id">;
