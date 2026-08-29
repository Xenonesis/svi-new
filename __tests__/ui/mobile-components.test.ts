import { describe, it, expect } from 'vitest';
import { AdaptiveRecordTable, type ColumnDef } from '@/src/components/admin/AdaptiveRecordTable';

describe('Mobile-First Adaptive Component Architecture', () => {
  interface SampleRecord {
    id: string;
    name: string;
    status: string;
    phone: string;
    created_at: string;
  }

  const sampleData: SampleRecord[] = [
    {
      id: 'rec-1',
      name: 'Rohan Sharma',
      status: 'Active',
      phone: '+91 9876543210',
      created_at: '2026-08-29',
    },
    {
      id: 'rec-2',
      name: 'Priya Verma',
      status: 'Pending',
      phone: '+91 9123456780',
      created_at: '2026-08-28',
    },
  ];

  const columns: ColumnDef<SampleRecord>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      isPrimary: true,
      render: (item) => item.name,
    },
    {
      key: 'status',
      header: 'Status',
      isBadge: true,
      render: (item) => item.status,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item) => item.phone,
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (item) => item.created_at,
    },
  ];

  it('should define primary and badge columns for card extraction', () => {
    const primaryCol = columns.find((c) => c.isPrimary);
    const badgeCols = columns.filter((c) => c.isBadge);
    const detailCols = columns.filter((c) => !c.isPrimary && !c.isBadge && !c.hideOnMobile);

    expect(primaryCol).toBeDefined();
    expect(primaryCol?.key).toBe('name');
    expect(badgeCols).toHaveLength(1);
    expect(badgeCols[0].key).toBe('status');
    expect(detailCols).toHaveLength(2);
  });

  it('should extract correct unique keys from record items', () => {
    const keyExtractor = (item: SampleRecord) => item.id;
    expect(keyExtractor(sampleData[0])).toBe('rec-1');
    expect(keyExtractor(sampleData[1])).toBe('rec-2');
  });
});
