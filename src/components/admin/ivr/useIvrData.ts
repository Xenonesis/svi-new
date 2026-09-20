import { useState, useEffect, useCallback, useRef } from 'react';
import type { CallRecord } from './IvrLogsTable';
import type { IvrTab } from './IvrTabNav';
import type { IvrStatics } from './IvrStatsGrid';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

export interface IvrFilterOverrides {
  virtualNumber?: string;
  toNumber?: string;
  fromNumber?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface UseIvrDataOptions {
  token: string | null;
  activeTab: IvrTab;
  limit?: number;
}

export interface IvrFilterProps {
  virtualNumber: string;
  setVirtualNumber: (val: string) => void;
  toNumber: string;
  setToNumber: (val: string) => void;
  fromNumber: string;
  setFromNumber: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  clearFilters: () => void;
  fetchHistory: (page?: number) => void;
}

export interface IvrLogsTablePropsData {
  loading: boolean;
  calls: CallRecord[];
  fetchHistory: (page?: number) => void;
  totalCount: number;
  page: number;
  limit: number;
  handlePageChange: (newPage: number) => void;
}

export interface UseIvrDataReturn {
  calls: CallRecord[];
  totalCount: number;
  statics: IvrStatics;
  loading: boolean;
  page: number;
  limit: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  fetchError: string | null;
  virtualNumber: string;
  setVirtualNumber: (val: string) => void;
  toNumber: string;
  setToNumber: (val: string) => void;
  fromNumber: string;
  setFromNumber: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  fetchHistory: (targetPage?: number, filtersOverride?: IvrFilterOverrides) => Promise<void>;
  handlePageChange: (newPage: number) => void;
  clearFilters: () => void;
  filterProps: IvrFilterProps;
  logsTableProps: IvrLogsTablePropsData;
}

export function useIvrData({ token, activeTab, limit = 8 }: UseIvrDataOptions): UseIvrDataReturn {
  // Call History State
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statics, setStatics] = useState<IvrStatics>({ total: 0, answered: 0, missed: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Real data state trackers
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter States
  const [virtualNumber, setVirtualNumber] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch History
  const fetchHistory = useCallback(
    async (targetPage?: number, filtersOverride?: IvrFilterOverrides) => {
      if (!token) return;
      setLoading(true);
      setFetchError(null);
      try {
        const currentPage = targetPage ?? page;
        const offset = (currentPage - 1) * limit;
        const apiAction = activeTab === 'outgoing' ? 'outgoing-history' : 'history';

        const queryParams = new URLSearchParams({
          action: apiAction,
          offset: String(offset),
          limit: String(limit),
        });

        const vn =
          filtersOverride?.virtualNumber !== undefined
            ? filtersOverride.virtualNumber
            : virtualNumber;
        const tn = filtersOverride?.toNumber !== undefined ? filtersOverride.toNumber : toNumber;
        const fn =
          filtersOverride?.fromNumber !== undefined ? filtersOverride.fromNumber : fromNumber;
        const st = filtersOverride?.status !== undefined ? filtersOverride.status : status;
        const sd = filtersOverride?.startDate !== undefined ? filtersOverride.startDate : startDate;
        const ed = filtersOverride?.endDate !== undefined ? filtersOverride.endDate : endDate;

        if (vn) queryParams.append('virtual_number', vn);
        if (tn) queryParams.append('to_number', tn);
        if (fn) queryParams.append('from_number', fn);
        if (st !== 'all') queryParams.append('status', st.toUpperCase());
        if (sd) queryParams.append('start_date', sd);
        if (ed) queryParams.append('end_date', ed);

        const res = await fetch(`/api/admin/ivr?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

        if (!res.ok) {
          setFetchError(json.status?.message || `Gateway returned error ${res.status}`);
          setCalls([]);
          setTotalCount(0);
          return;
        }

        setCalls(json.data || []);
        setTotalCount(json.statics?.total || 0);
        setStatics({
          total: json.statics?.total || 0,
          answered: json.statics?.answered || 0,
          missed: json.statics?.missed || 0,
        });
      } catch (err: unknown) {
        console.error(err);
        setFetchError(
          extractApiErrorMessage(err, 'An error occurred while connecting to the proxy service.')
        );
        setCalls([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [token, page, limit, activeTab, virtualNumber, toNumber, fromNumber, status, startDate, endDate]
  );

  const fetchHistoryRef = useRef(fetchHistory);
  useEffect(() => {
    fetchHistoryRef.current = fetchHistory;
  });

  // Fetch when tab changes or token changes
  useEffect(() => {
    if (activeTab === 'incoming' || activeTab === 'outgoing') {
      setPage(1);
      fetchHistoryRef.current(1);
    }
  }, [activeTab, token]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchHistory(newPage);
    },
    [fetchHistory]
  );

  const clearFilters = useCallback(() => {
    setVirtualNumber('');
    setToNumber('');
    setFromNumber('');
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
    fetchHistory(1, {
      virtualNumber: '',
      toNumber: '',
      fromNumber: '',
      status: 'all',
      startDate: '',
      endDate: '',
    });
  }, [fetchHistory]);

  const filterProps: IvrFilterProps = {
    virtualNumber,
    setVirtualNumber,
    toNumber,
    setToNumber,
    fromNumber,
    setFromNumber,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
    fetchHistory,
  };

  const logsTableProps: IvrLogsTablePropsData = {
    loading,
    calls,
    fetchHistory,
    totalCount,
    page,
    limit,
    handlePageChange,
  };

  return {
    calls,
    totalCount,
    statics,
    loading,
    page,
    limit,
    setPage,
    fetchError,
    virtualNumber,
    setVirtualNumber,
    toNumber,
    setToNumber,
    fromNumber,
    setFromNumber,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    fetchHistory,
    handlePageChange,
    clearFilters,
    filterProps,
    logsTableProps,
  };
}
