export type CorridorType = "NUM" | "H" | "V" | "D";

export type UrbanBusRoute = {
  id: string;
  lineCode: string;
  corridorType: CorridorType;
  routeName: string;
  terminalStart: string;
  terminalEnd: string;
  frequencyMinutes: number;
  isAccessible: boolean;
};

export type UrbanBusRouteInput = Omit<UrbanBusRoute, "id">;
