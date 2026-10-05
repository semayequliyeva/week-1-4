'use client';

import React, { useState, useMemo } from 'react';
import { MOCK_SALES } from '../data/salesData';

// Aqreqasiya olunmus datanin tipi
interface AggregatedItem {
  label: string;
  value: number;
  count: number;
}

export default function DynamicBarChart() {
  // Filtrlerin mentiqi veziyyeti (state)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [groupBy, setGroupBy] = useState<'category' | 'region'>('category');

  // Rejimler ve accessibility steytleri
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);

  // Hover olunan sutun melumati (tooltip ucun)
  const [hoveredBar, setHoveredBar] = useState<{
    label: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Unikal filter siyahilarinin hazirlanmasi
  const categories = useMemo(() => ['ALL', ...Array.from(new Set(MOCK_SALES.map((d) => d.category)))], []);
  const regions = useMemo(() => ['ALL', ...Array.from(new Set(MOCK_SALES.map((d) => d.region)))], []);

  // 1. Datalarin secilmis filtrelere gore temizlenmesi
  const filteredRawData = useMemo(() => {
    return MOCK_SALES.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false;
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      return true;
    });
  }, [selectedCategory, selectedRegion, startDate, endDate]);

  // 2. Performans optimizasiyasi ucun useMemo daxilinde cemleme (aggregation)
  const chartData = useMemo<AggregatedItem[]>(() => {
    const map = new Map<string, { total: number; count: number }>();

    filteredRawData.forEach((item) => {
      const key = groupBy === 'category' ? item.category : item.region;
      const current = map.get(key) || { total: 0, count: 0 };
      map.set(key, {
        total: current.total + item.amount,
        count: current.count + 1,
      });
    });

    return Array.from(map.entries()).map(([label, data]) => ({
      label,
      value: data.total,
      count: data.count,
    }));
  }, [filteredRawData, groupBy]);

  // SVG olculeri ve kenar bosluqlari
  const width = 800;
  const height = 400;
  const padding = { top: 40, right: 30, bottom: 60, left: 80 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Y oxunun maksimum deyeri (bos massiv olduqda NaN xetasinin qarsisini alir)
  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const max = Math.max(...chartData.map((d) => d.value));
    return max > 0 ? max : 100;
  }, [chartData]);

  // Y oxunun koordinat hesablama funksiyasi (ters cevrilme nezere alinir)
  const getY = (v: number) => padding.top + innerH - (v / maxValue) * innerH;

  // Filtirlenmis datalari CSV formatinda endirme funksiyasi
  const handleExportCSV = () => {
    if (filteredRawData.length === 0) return;

    const headers = ['ID,Date,Category,Region,Amount'];
    const rows = filteredRawData.map(
      (d) => `${d.id},${d.date},${d.category},${d.region},${d.amount}`
    );
    const csvContent = [...headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const themeClasses = isDarkMode
    ? 'bg-gray-900 text-gray-100 border-gray-700'
    : 'bg-white text-gray-800 border-gray-200';

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';

  return (
    <div className={`max-w-5xl mx-auto p-6 rounded-2xl border shadow-lg transition-colors duration-300 ${themeClasses}`}>
      {/* Basliq ve idareetme duymeleri */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dynamic Sales Chart</h2>
          <p className="text-sm opacity-75">Custom SVG graphics with interactive controls</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-3 py-1.5 text-sm rounded-lg border font-medium hover:opacity-80 transition"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredRawData.length === 0}
            className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Filtr paneli */}
      <div className={`p-4 rounded-xl border mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 ${cardBg}`}>
        <div>
          <label className="block text-xs font-semibold mb-1">Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'category' | 'region')}
            className="w-full text-sm p-2 rounded-md border bg-transparent"
          >
            <option value="category">Category</option>
            <option value="region">Region</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-sm p-2 rounded-md border bg-transparent"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full text-sm p-2 rounded-md border bg-transparent"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === 'ALL' ? 'All Regions' : r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-sm p-2 rounded-md border bg-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-sm p-2 rounded-md border bg-transparent"
          />
        </div>
      </div>

      {/* SVG Qrafik Sahesi */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-labelledby="chart-title chart-desc"
        >
          <title id="chart-title">Sales Data Bar Chart</title>
          <desc id="chart-desc">
            Total sales amount grouped by {groupBy === 'category' ? 'Categories' : 'Regions'}.
          </desc>

          {/* Tor xetleri ve Y oxu reqemleri */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(maxValue * ratio);
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
                >
                  ${val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Datalar bos olduqda gosterilen mesaj */}
          {chartData.length === 0 && (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
              fontSize="16"
            >
              No data available for the selected filters.
            </text>
          )}

          {/* Sutunlarin yaradilmasi */}
          {chartData.map((item, index) => {
            const totalItems = chartData.length;
            const slotWidth = innerW / totalItems;
            const barWidth = Math.max(Math.min(slotWidth * 0.55, 60), 16);
            const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
            const barHeight = (item.value / maxValue) * innerH;
            const y = getY(item.value);

            return (
              <g key={item.label} className="group cursor-pointer">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  fill={isDarkMode ? '#60A5FA' : '#2563EB'}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${item.label}: $${item.value}`}
                  style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  onMouseEnter={() =>
                    setHoveredBar({ label: item.label, value: item.value, x: x + barWidth / 2, y })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                  onFocus={() =>
                    setHoveredBar({ label: item.label, value: item.value, x: x + barWidth / 2, y })
                  }
                  onBlur={() => setHoveredBar(null)}
                  className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <text
                  x={x + barWidth / 2}
                  y={height - padding.bottom + 24}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  fill={isDarkMode ? '#D1D5DB' : '#374151'}
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {/* Esas ox xetleri */}
          <line
            x1={padding.left}
            y1={padding.top + innerH}
            x2={width - padding.right}
            y2={padding.top + innerH}
            stroke={isDarkMode ? '#4B5563' : '#9CA3AF'}
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + innerH}
            stroke={isDarkMode ? '#4B5563' : '#9CA3AF'}
            strokeWidth="2"
          />
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredBar && (
          <div
            className="absolute pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-1.5 text-xs font-semibold rounded-md shadow-md bg-gray-900 text-white z-10"
            style={{
              left: `${(hoveredBar.x / width) * 100}%`,
              top: `${(hoveredBar.y / height) * 100}%`,
            }}
          >
            <div>{hoveredBar.label}</div>
            <div className="text-blue-400 font-bold">${hoveredBar.value.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Ekran oxuyuculari ucun kecidli cedvel (Accessibility) */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowTable(!showTable)}
          className="text-xs font-medium underline text-blue-500 hover:text-blue-600 focus:outline-none"
        >
          {showTable ? 'Hide Data Table' : 'Show Data Table (Accessibility Mode)'}
        </button>

        {showTable && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                  <th className="p-2 border">{groupBy === 'category' ? 'Category' : 'Region'}</th>
                  <th className="p-2 border">Total Sales ($)</th>
                  <th className="p-2 border">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row) => (
                  <tr key={row.label} className="border-b">
                    <td className="p-2 border font-medium">{row.label}</td>
                    <td className="p-2 border">${row.value.toLocaleString()}</td>
                    <td className="p-2 border">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}