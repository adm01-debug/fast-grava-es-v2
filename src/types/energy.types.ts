export interface EnergyReading {
  id: string;
  machineId: string;
  consumption: number;
  unit: 'kWh';
  timestamp: string;
}

export interface EnergyCost {
  period: string;
  totalConsumption: number;
  totalCost: number;
  costPerUnit: number;
}
