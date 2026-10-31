export type SV13PlotStatus = 'AVAILABLE' | 'BOOKED' | 'RESERVED';

export interface SV13PlotData {
  plotNo: string;
  sizeSqYd: number;
  dimensions: string;
  facing: 'East' | 'North' | 'West' | 'South' | 'Park Facing' | 'Corner';
  roadWidth: string;
  status: SV13PlotStatus;
  pricePerMonth: number;
  totalCostEstimate: number;
  highlight?: string;
}

export function generateSV13Plots(): SV13PlotData[] {
  const plots: SV13PlotData[] = [];

  for (let i = 1; i <= 60; i++) {
    const isCorner = [1, 15, 16, 30, 31, 45, 46, 60].includes(i);
    const isParkFacing = [10, 11, 12, 13, 14, 25, 26, 27, 28, 29].includes(i);
    const isNearTemple = [1, 2, 3, 16, 17].includes(i);

    let sizeSqYd = 100;
    let dimensions = '20\'-0" x 45\'-0"';
    let facing: SV13PlotData['facing'] = i % 2 === 0 ? 'North' : 'South';

    if (isCorner) {
      sizeSqYd = 125;
      dimensions = '25\'-0" x 45\'-0"';
      facing = 'Corner';
    } else if (isParkFacing) {
      sizeSqYd = 100;
      dimensions = '20\'-0" x 45\'-0"';
      facing = 'Park Facing';
    } else if (i > 45) {
      sizeSqYd = 80;
      dimensions = '18\'-0" x 40\'-0"';
      facing = i % 2 === 0 ? 'East' : 'West';
    }

    // Default status: authentic representation
    let status: SV13PlotStatus = 'AVAILABLE';
    if ([3, 7, 15, 22, 28, 35, 42, 51].includes(i)) {
      status = 'BOOKED';
    } else if ([12, 19, 39, 58].includes(i)) {
      status = 'RESERVED';
    }

    let highlight: string | undefined;
    if (isCorner) highlight = 'Corner Advantage (Wide Road Access)';
    else if (isParkFacing) highlight = 'Lush Green Park Facing View';
    else if (isNearTemple) highlight = 'Peaceful Temple Proximity';

    plots.push({
      plotNo: String(i),
      sizeSqYd,
      dimensions,
      facing,
      roadWidth: '30 Ft Internal Road',
      status,
      pricePerMonth: 9999,
      totalCostEstimate: sizeSqYd * 8500,
      highlight,
    });
  }

  return plots;
}

export const SHIVANI_VATIKA_13_PLOTS = generateSV13Plots();
