import React, { useState, useMemo } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ComposedChart, Label } from 'recharts';
import { Wind, Weight, Zap, Info } from 'lucide-react';

const App = () => {
  // Parameters for a typical high-performance glider or human-powered aircraft
  // Base polar: w = a*v^2 + b*v + c
  const baseA = 0.0005;
  const baseB = -0.02;
  const baseC = 0.8;

  const [wind, setWind] = useState(0); // Headwind (positive) or Tailwind (negative)
  const [gLoad, setGLoad] = useState(1.0); // Load factor

  // Calculate the polar curve data points
  const data = useMemo(() => {
    const points = [];
    const gFactor = Math.sqrt(gLoad);
    
    // Fixed range iteration to keep the curve length consistent
    for (let vBase = 10; vBase <= 120; vBase += 2) {
      const vAir = vBase * gFactor;
      const wBase = baseA * Math.pow(vBase, 2) + baseB * vBase + baseC;
      const wSink = wBase * gFactor;
      
      points.push({
        vAir: parseFloat(vAir.toFixed(2)),
        wSink: parseFloat(wSink.toFixed(2)),
      });
    }
    return points;
  }, [gLoad]);

  // Find the tangent point (Best Glide Speed over ground)
  const bestGlide = useMemo(() => {
    let minSlope = Infinity;
    let bestPoint = data[0];

    data.forEach((p) => {
      const groundSpeed = p.vAir - wind;
      // We only consider positive ground speeds for glide optimization
      if (groundSpeed <= 5) return; 
      const slope = p.wSink / groundSpeed;
      if (slope < minSlope) {
        minSlope = slope;
        bestPoint = p;
      }
    });

    return bestPoint;
  }, [data, wind]);

  // Tangent line data for visualization
  const tangentLineData = useMemo(() => {
    if (!bestGlide) return [];
    // Drawing a line from the Wind Origin through the Best Glide point
    return [
      { vAir: wind, wSink: 0 },
      { vAir: bestGlide.vAir, wSink: bestGlide.wSink },
      { vAir: bestGlide.vAir + (bestGlide.vAir - wind) * 0.8, wSink: bestGlide.wSink * 1.8 }
    ];
  }, [bestGlide, wind]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-2">
          <Zap className="text-amber-500" />
          ポーラーカーブ・ダイナミクス
        </h1>
        <p className="text-slate-500 mt-1 italic">
          固定レンジによる精密観測。変化の真髄は、不動の枠組みの中にこそ現れますわ。
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
        {/* Control Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Wind size={18} className="text-blue-500" />
              風速 (向かい風 + / 追い風 -)
            </label>
            <input
              type="range"
              min="-40"
              max="60"
              step="1"
              value={wind}
              onChange={(e) => setWind(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
              <span className={wind < 0 ? "text-blue-600 font-bold" : ""}>Tail {wind < 0 ? -wind : 0}</span>
              <span className="bg-slate-100 px-2 py-1 rounded">{wind} km/h</span>
              <span className={wind > 0 ? "text-blue-600 font-bold" : ""}>Head {wind > 0 ? wind : 0}</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Weight size={18} className="text-rose-500" />
              荷重倍数 (G)
            </label>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={gLoad}
              onChange={(e) => setGLoad(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
              <span>0.5G</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-rose-600 font-bold">{gLoad.toFixed(1)} G</span>
              <span>4.0G</span>
            </div>
          </div>

          <div className="mt-auto p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info size={14} /> 解析データ
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">最良対気速度:</span>
                <span className="font-bold text-indigo-900">{bestGlide.vAir} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">対地速度:</span>
                <span className="font-bold text-indigo-900">{(bestGlide.vAir - wind).toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">沈下率:</span>
                <span className="font-bold text-indigo-900">{bestGlide.wSink} m/s</span>
              </div>
              <div className="flex justify-between border-t border-indigo-200 pt-2 mt-2">
                <span className="text-slate-600 font-semibold text-indigo-700 underline decoration-indigo-300">最大滑空比 (対地):</span>
                <span className="font-bold text-indigo-900">
                  {(((bestGlide.vAir - wind) / 3.6) / bestGlide.wSink).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area with Fixed Domains */}
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              
              {/* FIXED X-AXIS DOMAIN [-50 to 180] */}
              <XAxis 
                type="number" 
                dataKey="vAir" 
                domain={[-50, 180]} 
                allowDataOverflow={false}
                stroke="#64748b"
                ticks={[-50, -25, 0, 25, 50, 75, 100, 125, 150, 175]}
              >
                <Label value="対気速度 (Airspeed) [km/h]" offset={-10} position="insideBottom" fill="#64748b" />
              </XAxis>
              
              {/* FIXED Y-AXIS DOMAIN [0 to 6] */}
              <YAxis 
                type="number" 
                dataKey="wSink" 
                domain={[0, 6]} 
                reversed 
                allowDataOverflow={false}
                stroke="#64748b"
              >
                <Label value="沈下率 (Sink Rate) [m/s]" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#64748b" />
              </YAxis>

              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(v) => `対気速度: ${v} km/h`}
              />
              
              {/* The Polar Curve */}
              <Line
                data={data}
                type="monotone"
                dataKey="wSink"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
                name="Polar Curve"
                isAnimationActive={false}
              />

              {/* Tangent Line from Wind Origin */}
              <Line
                data={tangentLineData}
                type="linear"
                dataKey="wSink"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                tooltipType="none"
              />

              {/* Best Glide Point */}
              <Scatter 
                name="Best Glide Point" 
                data={[bestGlide]} 
                fill="#f59e0b" 
              />

              {/* Origin of Tangent (Wind Point) */}
              <ReferenceLine 
                x={wind} 
                stroke="#3b82f6" 
                strokeWidth={2} 
                label={{ position: 'top', value: `Wind Origin (${wind})`, fill: '#3b82f6', fontSize: 12, fontWeight: 'bold' }} 
              />

              {/* Static Reference: Zero Airspeed Line */}
              <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
              
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer / Knowledge Base */}
      <footer className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="font-bold text-slate-700 block mb-1 underline decoration-blue-200">定点観測のポイント</span>
          X軸の左側（マイナス域）に注目なさって。追い風の時、接線の始点が原点より左へ移動することで、カーブのより「山に近い部分（低速域）」が最適点になるのが視覚的に一目瞭然ですわ。
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="font-bold text-slate-700 block mb-1 underline decoration-rose-200">荷重による「相似拡大」</span>
          Gスライダーを動かすと、カーブが原点 $(0,0)$ を中心に放射状に伸び縮みするのが分かりますかしら？これが翼面荷重の変化による性能曲線の本質的な挙動なんですのよ。
        </div>
      </footer>
    </div>
  );
};

export default App;