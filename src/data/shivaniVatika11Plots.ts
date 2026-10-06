export type PlotBlock = 'Residential' | 'A-Block' | 'Commercial';
export type PlotStatus = 'AVAILABLE' | 'BOOKED' | 'RESERVED';

export interface PlotData {
  plotNo: string;
  block: PlotBlock;
  sizeSqYd: number;
  dimensions: string;
  facing: 'East' | 'North' | 'West' | 'South' | 'Park Facing' | 'Corner' | 'Highway';
  roadWidth: string;
  status: PlotStatus;
  priceEstimate: number;
}

/**
 * Normalizes a unit number string by removing 'Plot', 'Unit', '#', and extraneous whitespace.
 * Returns a trimmed lowercase string suitable for allotment matching and key lookups.
 */
export function normalizeUnitNumber(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/^(?:plot|unit)[\s#.:-]*/i, '')
    .replace(/\b(plot|unit)\b/gi, '')
    .replace(/[#]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Splits compound unit strings (e.g., '126+127', '94,95', 'Plot #126 & Unit 127')
 * and returns an array of trimmed, normalized unit strings.
 */
export function parseCompoundUnitNumbers(raw: string): string[] {
  if (!raw || typeof raw !== 'string') return [];
  const parts = raw.split(/[,+&]|\band\b/i);
  return parts.map((part) => normalizeUnitNumber(part)).filter((part) => part.length > 0);
}

// 1. Commercial: 12 Frontage Retail Plots along 160 Ft Highway
const COMMERCIAL_PLOTS: PlotData[] = [
  {
    plotNo: 'Shop-1',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: '9\'-0" x 20\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
  {
    plotNo: 'Shop-2',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: '9\'-0" x 20\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
  {
    plotNo: 'Shop-3',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: '9\'-0" x 20\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
  {
    plotNo: 'Shop-4',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: '9\'-0" x 20\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
  {
    plotNo: 'Shop-5',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: '9\'-0" x 20\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
  {
    plotNo: 'Shop-6',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: '9\'-0" x 20\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
  {
    plotNo: 'Shop-7',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: '9\'-0" x 20\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
  {
    plotNo: 'Shop-8',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: '9\'-0" x 20\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
  {
    plotNo: 'Shop-9',
    block: 'Commercial',
    sizeSqYd: 27.77,
    dimensions: '10\'-0" x 25\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 347125,
  },
  {
    plotNo: 'Shop-10',
    block: 'Commercial',
    sizeSqYd: 41.66,
    dimensions: '15\'-0" x 25\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 520750,
  },
  {
    plotNo: 'Shop-11',
    block: 'Commercial',
    sizeSqYd: 50,
    dimensions: '18\'-0" x 25\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 625000,
  },
  {
    plotNo: 'Shop-12',
    block: 'Commercial',
    sizeSqYd: 65,
    dimensions: '23\'-5" x 25\'-0"',
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 812500,
  },
];

// 2. A-Block: 50 Plots (A-1 to A-50)
function buildABlockPlots(): PlotData[] {
  const plots: PlotData[] = [];
  for (let i = 1; i <= 50; i++) {
    let size = 80;
    let dims = '20\'-0" x 36\'-0"';
    let facing: PlotData['facing'] = i % 2 === 0 ? 'East' : 'West';

    if (i === 1) {
      size = 104.66;
      dims = '25\'-1" x 37\'-1"';
      facing = 'Corner';
    } else if (i === 2) {
      size = 158;
      dims = '35\'-11" x 39\'-7"';
      facing = 'East';
    } else if (i === 3) {
      size = 133;
      dims = '20\'-0" x 59\'-11"';
      facing = 'East';
    } else if (i === 4) {
      size = 250;
      dims = '37\'-9" x 59\'-8"';
      facing = 'Corner';
    } else if (i === 9 || i === 10) {
      size = 95.55;
      dims = '20\'-0" x 43\'-0"';
      facing = 'North';
    } else if (i >= 11 && i <= 14) {
      size = 100;
      dims = '20\'-0" x 45\'-0"';
      facing = 'East';
    } else if (i >= 21 && i <= 24) {
      size = 75;
      dims = '18\'-0" x 37\'-6"';
      facing = 'West';
    } else if (i === 25) {
      size = 104;
      dims = '23\'-0" x 40\'-9"';
      facing = 'Corner';
    } else if (i >= 26 && i <= 28) {
      size = 75;
      dims = '18\'-2" x 37\'-1"';
      facing = 'West';
    } else if (i >= 37 && i <= 40) {
      size = 100;
      dims = '20\'-0" x 45\'-0"';
      facing = 'East';
    } else if (i === 46) {
      size = 200;
      dims = '30\'-0" x 60\'-0"';
      facing = 'Park Facing';
    } else if (i === 47) {
      size = 250;
      dims = '37\'-9" x 59\'-8"';
      facing = 'Corner';
    } else if (i === 48) {
      size = 136;
      dims = '34\'-0" x 36\'-0"';
      facing = 'East';
    } else if (i === 49) {
      size = 74.77;
      dims = '18\'-8" x 36\'-0"';
      facing = 'West';
    } else if (i === 50) {
      size = 81.44;
      dims = '18\'-8" x 39\'-3"';
      facing = 'Corner';
    }

    plots.push({
      plotNo: `A-${i}`,
      block: 'A-Block',
      sizeSqYd: size,
      dimensions: dims,
      facing,
      roadWidth: '30 Ft Internal',
      status: 'AVAILABLE',
      priceEstimate: Math.round(size * 7500),
    });
  }
  return plots;
}

// 3. Residential: 168 Plots (9 'A' suffix variants + 159 numbered plots)
function buildResidentialPlots(): PlotData[] {
  const plots: PlotData[] = [];

  // 9 'A' suffix variants (1A to 9A)
  const aVariants: Array<{
    plotNo: string;
    size: number;
    dims: string;
    facing: PlotData['facing'];
  }> = [
    { plotNo: '1A', size: 160, dims: '20\'-0" x 72\'-0"', facing: 'Corner' },
    { plotNo: '2A', size: 100, dims: '20\'-0" x 45\'-0"', facing: 'North' },
    { plotNo: '3A', size: 140, dims: '28\'-0" x 45\'-0"', facing: 'North' },
    { plotNo: '4A', size: 100, dims: '20\'-0" x 45\'-0"', facing: 'North' },
    { plotNo: '5A', size: 100, dims: '25\'-0" x 36\'-0"', facing: 'North' },
    { plotNo: '6A', size: 100, dims: '25\'-0" x 36\'-0"', facing: 'North' },
    { plotNo: '7A', size: 65, dims: '16\'-3" x 36\'-0"', facing: 'North' },
    { plotNo: '8A', size: 88, dims: '22\'-0" x 36\'-0"', facing: 'North' },
    { plotNo: '9A', size: 100, dims: '25\'-0" x 36\'-0"', facing: 'North' },
  ];

  aVariants.forEach((v) => {
    plots.push({
      plotNo: v.plotNo,
      block: 'Residential',
      sizeSqYd: v.size,
      dimensions: v.dims,
      facing: v.facing,
      roadWidth: '30 Ft Internal',
      status: 'AVAILABLE',
      priceEstimate: Math.round(v.size * 7500),
    });
  });

  // 159 Numbered plots spanning 1-198 (1-156, 181, 182, 198)
  const numericIds: number[] = [];
  for (let i = 1; i <= 156; i++) {
    numericIds.push(i);
  }
  numericIds.push(181, 182, 198);

  numericIds.forEach((num) => {
    let size = 80;
    let dims = '20\'-0" x 36\'-0"';
    let facing: PlotData['facing'] = num % 2 === 0 ? 'East' : 'West';
    let roadWidth = '30 Ft Internal';

    if (num === 1) {
      size = 100;
      dims = "25' x 36'";
      facing = 'East';
    } else if (num === 2) {
      size = 100.45;
      dims = '17\'-3" x 52\'-5"';
      facing = 'North';
    } else if (num === 3) {
      size = 108;
      dims = '20\'-1" x 48\'-4"';
      facing = 'North';
    } else if (num >= 4 && num <= 6) {
      size = 100;
      dims = '20\'-0" x 45\'-0"';
      facing = 'North';
    } else if (num === 7) {
      size = 73;
      dims = '18\'-3" x 36\'-0"';
      facing = 'East';
    } else if (num === 8) {
      size = 88;
      dims = '22\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num >= 9 && num <= 10) {
      size = 100;
      dims = '25\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num === 11) {
      size = 77.22;
      dims = '26\'-2" x 26\'-6"';
      facing = 'Corner';
    } else if (num === 12) {
      size = 40;
      dims = '15\'-8" x 23\'-0"';
      facing = 'West';
    } else if (num === 13 || num === 16) {
      size = 130;
      dims = '26\'-0" x 45\'-0"';
      facing = num === 16 ? 'Corner' : 'West';
    } else if (num === 14 || num === 15) {
      size = 80;
      dims = '20\'-0" x 36\'-0"';
      facing = 'West';
    } else if (num === 17) {
      size = 131;
      dims = '26\'-2" x 45\'-0"';
      facing = 'East';
    } else if (num === 18) {
      size = 62.22;
      dims = '21\'-10" x 25\'-7"';
      facing = 'East';
    } else if (num === 19) {
      size = 55.77;
      dims = '20\'-0" x 25\'-1"';
      facing = 'East';
    } else if (num === 20) {
      size = 70.88;
      dims = '20\'-0" x 31\'-11"';
      facing = 'East';
    } else if (num === 21) {
      size = 85.66;
      dims = '20\'-0" x 38\'-7"';
      facing = 'East';
    } else if (num === 22) {
      size = 100;
      dims = '20\'-0" x 45\'-0"';
      facing = 'East';
    } else if (num === 23) {
      size = 112.44;
      dims = '20\'-2" x 50\'-1"';
      facing = 'East';
    } else if (num === 24) {
      size = 100;
      dims = '18\'-8" x 48\'-3"';
      facing = 'Corner';
    } else if (num === 25 || num === 26) {
      size = 100;
      dims = '20\'-0" x 45\'-0"';
      facing = 'West';
    } else if (num === 27) {
      size = 85.66;
      dims = '20\'-0" x 38\'-7"';
      facing = 'West';
    } else if (num === 28) {
      size = 70.88;
      dims = '20\'-0" x 31\'-11"';
      facing = 'West';
    } else if (num === 29) {
      size = 55.77;
      dims = '20\'-0" x 25\'-1"';
      facing = 'West';
    } else if (num === 30) {
      size = 100;
      dims = '20\'-0" x 45\'-0"';
      facing = 'West';
    } else if (num === 31) {
      size = 100;
      dims = "25' x 36'";
      facing = 'North';
    } else if (num === 32) {
      size = 80;
      dims = "20' x 36'";
      facing = 'East';
    } else if (num === 33) {
      size = 113.32;
      dims = '28\'-4" x 36\'-0"';
      facing = 'East';
    } else if (num >= 34 && num <= 39) {
      size = 60;
      dims = '15\'-0" x 36\'-0"';
      facing = 'Park Facing';
    } else if (num === 40) {
      size = 128;
      dims = '32\'-0" x 36\'-0"';
      facing = 'Corner';
    } else if (num === 45) {
      size = 100;
      dims = "25' x 36'";
      facing = 'Park Facing';
    } else if (num === 48 || num === 49 || num === 50) {
      size = 144;
      dims = '36\'-0" x 36\'-0"';
      facing = 'North';
      roadWidth = '40 Ft Main Spine';
    } else if (num === 51 || num === 52) {
      size = 100;
      dims = '25\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num === 53) {
      size = 200;
      dims = '50\'-0" x 36\'-0"';
      facing = 'Corner';
    } else if (num === 59 || num === 60) {
      size = 100;
      dims = '25\'-0" x 36\'-0"';
      facing = 'Corner';
    } else if (num >= 69 && num <= 71) {
      size = 144;
      dims = '36\'-0" x 36\'-0"';
      facing = 'South';
      roadWidth = '40 Ft Main Spine';
    } else if (num === 72) {
      size = 64;
      dims = '16\'-0" x 36\'-0"';
      facing = 'West';
    } else if (num === 79 || num === 80) {
      size = 128;
      dims = '32\'-0" x 36\'-0"';
      facing = 'Corner';
    } else if (num === 81) {
      size = 127.92;
      dims = '28\'-5" x 40\'-6"';
      facing = 'Corner';
    } else if (num >= 87 && num <= 89) {
      size = 64;
      dims = '16\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num === 90 || num === 91) {
      size = 144;
      dims = '36\'-0" x 36\'-0"';
      facing = 'North';
      roadWidth = '40 Ft Main Spine';
    } else if (num === 92) {
      size = 40;
      dims = '10\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num === 94 || num === 95) {
      size = 100;
      dims = '25\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num === 110) {
      size = 144;
      dims = '36\'-0" x 36\'-0"';
      facing = 'South';
      roadWidth = '40 Ft Main Spine';
    } else if (num === 111 || num === 112) {
      size = 64;
      dims = '16\'-0" x 36\'-0"';
      facing = 'West';
    } else if (num >= 120 && num <= 125) {
      size = 64;
      dims = '16\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num === 126 || num === 127) {
      size = 50;
      dims = '12\'-6" x 36\'-0"';
      facing = 'East';
    } else if (num === 128 || num === 129) {
      size = 100;
      dims = '25\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num >= 130 && num <= 131) {
      size = 64;
      dims = '16\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num === 132 || num === 133) {
      size = 144;
      dims = '36\'-0" x 36\'-0"';
      facing = 'North';
      roadWidth = '40 Ft Main Spine';
    } else if (num >= 134 && num <= 140) {
      size = 64;
      dims = '16\'-0" x 36\'-0"';
      facing = 'East';
    } else if (num >= 141 && num <= 143) {
      size = 50;
      dims = '12\'-6" x 36\'-0"';
      facing = 'East';
    } else if (num === 144 || num === 145) {
      size = 100;
      dims = '25\'-0" x 36\'-0"';
      facing = 'Corner';
    } else if (num === 146) {
      size = 64;
      dims = '16\'-0" x 36\'-0"';
      facing = 'West';
    } else if (num >= 147 && num <= 148) {
      size = 50;
      dims = '12\'-6" x 36\'-0"';
      facing = 'West';
    } else if (num === 149) {
      size = 111.06;
      dims = '24\'-8" x 40\'-6"';
      facing = 'West';
    } else if (num >= 150 && num <= 155) {
      size = 64;
      dims = '16\'-0" x 36\'-0"';
      facing = 'West';
    } else if (num === 156) {
      size = 120;
      dims = '30\'-0" x 36\'-0"';
      facing = 'Corner';
    } else if (num === 181 || num === 182) {
      size = 150;
      dims = '30\'-0" x 45\'-0"';
      facing = 'North';
    } else if (num === 198) {
      size = 100;
      dims = '25\'-0" x 36\'-0"';
      facing = 'Corner';
    }

    plots.push({
      plotNo: String(num),
      block: 'Residential',
      sizeSqYd: size,
      dimensions: dims,
      facing,
      roadWidth,
      status: 'AVAILABLE',
      priceEstimate: Math.round(size * 7500),
    });
  });

  return plots;
}

/**
 * Complete 230-unit demarcated dataset for Shivani Vatika 11th.
 * Contains:
 * - 168 Residential plots (numbers 1-198 with compound merges and 'A' suffix variants like 1A-9A)
 * - 50 A-Block plots (A-1 to A-50)
 * - 12 Commercial frontage retail shops (Shop-1 to Shop-12)
 */
export const SHIVANI_VATIKA_11_PLOTS: PlotData[] = [
  ...buildResidentialPlots(),
  ...buildABlockPlots(),
  ...COMMERCIAL_PLOTS,
];
