"use client"
import { useState, useEffect, useRef } from "react";
import Nav from "./components/Nav";
import LineChart from "./components/LineChart";
import { dinjs } from "dinjs";
import { siteData } from "../../../data";

// Define types for our data
interface DataPoint {
  type: string;
  value: number;
  time: string;
  anomaly: boolean;
  timestamp: number;
}

interface GraphDataPoint {
  name: string;
  uv: number;
  anomaly: boolean;
}

export default function Hero() {
  const [active, setActive] = useState<string>('HeartRate');
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [anomalies, setAnomalies] = useState<DataPoint[]>([]);
  const [showAnomalies, setShowAnomalies] = useState<boolean>(false);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fixed server URL with correct format

  // Fetch data from server
  async function getData(): Promise<DataPoint[] | null> {
    try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

        const response = await fetch(`${siteData.IPofServer}/get_data?type=${active}`, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const newData: DataPoint[] = await response.json();
        processData(newData);
        setLoading(false);
        return newData;
    } catch (error) {
        console.error("Fetch Error:", error);
        setLoading(false);
        return null;
    }
}

  // Process data and maintain the queue of 10 most recent readings
  const processData = (newData: DataPoint[]): void => {
    if (!newData || !Array.isArray(newData)) return;
    
    setData(newData);
    
    // Create graph data with the latest 10 readings
    const tempGraphData: GraphDataPoint[] = newData.slice(-10).map(item => ({
      name: item.time,
      uv: item.value,
      anomaly: item.anomaly
    }));
    
    setGraphData(tempGraphData);
    
    // Process anomalies
    const newAnomalies: DataPoint[] = newData.filter(item => item.anomaly);
    
    // Get existing anomalies from localStorage
    let storedAnomalies: DataPoint[] = [];
    try {
      const stored = localStorage.getItem(`significantChanges_${active}`);
      storedAnomalies = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error parsing stored anomalies:", error);
    }
    
    // Merge new anomalies with stored ones, avoiding duplicates
    const mergedAnomalies: DataPoint[] = [...storedAnomalies];
    
    newAnomalies.forEach(anomaly => {
      if (!mergedAnomalies.some(item => item.timestamp === anomaly.timestamp)) {
        mergedAnomalies.push(anomaly);
      }
    });
    
    // Store updated anomalies
    localStorage.setItem(`significantChanges_${active}`, JSON.stringify(mergedAnomalies));
    setAnomalies(mergedAnomalies);
  };

  useEffect(() => {
    // Clear previous interval if exists
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
    }
    
    // Initial data fetch
    getData();
    
    // Set up interval for continuous data fetching
    fetchIntervalRef.current = setInterval(() => {
      getData();
    }, 5000);
    
    // Load stored anomalies for the active metric
    try {
      const stored = localStorage.getItem(`significantChanges_${active}`);
      if (stored) {
        setAnomalies(JSON.parse(stored));
      } else {
        setAnomalies([]);
      }
    } catch (error) {
      console.error("Error loading stored anomalies:", error);
      setAnomalies([]);
    }
    
    // Clean up interval on unmount or when active changes
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [active]); // Re-run when active changes

  const clearAnomalies = (): void => {
    localStorage.removeItem(`significantChanges_${active}`);
    setAnomalies([]);
  };

  const toggleAnomaliesView = (): void => {
    setShowAnomalies(!showAnomalies);
  };

  // Calculate average if data exists
  const calculateAverage = (): number => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + item.value, 0) / data.length;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Nav setActive={setActive} active={active} />

      <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col items-center mb-6">
          <h1 className="flex text-xl text-slate-700 items-center gap-2 justify-center text-center">
            <img src={`/icons/${active}.svg`} alt={active} className="h-10" />
            <span className="font-semibold">{active} Monitoring</span>
          </h1>
          <div className="text-slate-500 mt-1">
            {(new dinjs()).dateInBS}
          </div>
        </div>

        {/* Main content area */}
        <div className="relative">
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-r-blue-600 mb-3"></div>
              <div className="text-slate-500">Loading data...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Chart section */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-slate-700">Real-time {active} Data</h2>
                  <div className="text-sm text-slate-500">
                    {loading && (
                      <span className="flex items-center">
                        <span className="h-3 w-3 animate-pulse bg-blue-500 rounded-full mr-2"></span>
                        Updating...
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-64 w-full">
                  {graphData.length > 0 ? (
                    <LineChart data={graphData} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Stats summary */}
              {data && data.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-500">Current</div>
                    <div className="text-2xl font-bold text-slate-800">{data[data.length - 1]?.value.toFixed(1)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-500">Average</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {calculateAverage().toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-500">Anomalies</div>
                    <div className="text-2xl font-bold text-red-500">{anomalies.length}</div>
                  </div>
                </div>
              )}

              {/* Anomalies section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <button 
                    onClick={toggleAnomaliesView}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <span className="cursor-pointer">{showAnomalies ? 'Hide' : 'Show'} Anomalies</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {anomalies.length}
                    </span>
                  </button>
                  
                  {anomalies.length > 0 && (
                    <button 
                      onClick={clearAnomalies}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {showAnomalies && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    {anomalies.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {anomalies
                              .sort((a, b) => b.timestamp - a.timestamp) // Show newest first
                              .map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.time}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.value}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      Anomaly
                                    </span>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        No anomalies detected yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}