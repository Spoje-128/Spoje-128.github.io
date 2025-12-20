import React, { useState, useEffect, useRef } from 'react';
import { Plane, ArrowRight, Eye, RefreshCw } from 'lucide-react';

const CoordinateVisualizer = () => {
  const [alpha, setAlpha] = useState(15);
  const [viewMode, setViewMode] = useState('stability'); // 'body' or 'stability'
  const canvasRef = useRef(null);

  // Constants
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 150; // pixels per unit
  const vectorLength = 1.2;

  // Degrees to Radians
  const toRad = (deg) => (deg * Math.PI) / 180;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background grid
    drawGrid(ctx);

    // Context setup based on view mode
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Draw axes and aircraft
    drawSystem(ctx, alpha, viewMode);
    
    ctx.restore();
  }, [alpha, viewMode]);

  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY, color, label, isDashed = false) => {
    const headLen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    if (isDashed) ctx.setLineDash([5, 3]);
    else ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = '14px "Noto Sans JP", sans-serif';
    ctx.fillText(label, toX + 10, toY + 10);
  };

  const drawSystem = (ctx, alphaDeg, mode) => {
    const alphaRad = toRad(alphaDeg);
    
    // Rotation logic
    // In 'body' mode: Body axes are fixed (horizontal/vertical), Stability axes rotate
    // In 'stability' mode: Stability axes are fixed, Body axes rotate
    
    let bodyAngle = 0;
    let stabAngle = 0;

    if (mode === 'body') {
      bodyAngle = 0;
      stabAngle = alphaRad; // Stability axis rotates DOWN (positive Z) relative to body if alpha > 0
    } else {
      stabAngle = 0;
      bodyAngle = -alphaRad; // Body axis rotates UP (negative Z) relative to stability if alpha > 0
    }

    // --- Draw Body Axes (Blue) ---
    ctx.save();
    ctx.rotate(bodyAngle);
    
    // x_b axis
    drawArrow(ctx, 0, 0, scale * vectorLength, 0, '#2563eb', 'xb (機体軸)');
    // z_b axis (Down is positive in flight dynamics)
    drawArrow(ctx, 0, 0, 0, scale * vectorLength, '#2563eb', 'zb');

    // Draw Aircraft Silhouette
    ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scale * 0.8, 0); // Nose
    ctx.lineTo(-scale * 0.4, -scale * 0.1); // Tail top
    ctx.lineTo(-scale * 0.4, scale * 0.1); // Tail bottom
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-scale * 0.2, scale * 0.4);
    ctx.stroke();

    ctx.restore();

    // --- Draw Stability Axes (Red) ---
    ctx.save();
    ctx.rotate(stabAngle);
    
    // x_s axis (Velocity Vector direction)
    drawArrow(ctx, 0, 0, scale * vectorLength, 0, '#dc2626', 'xs (安定軸/速度V)', false);
    // z_s axis
    drawArrow(ctx, 0, 0, 0, scale * vectorLength, '#dc2626', 'zs');

    ctx.restore();

    // --- Draw Angle Arc ---
    // Draw arc between xb and xs
    ctx.save();
    // We want the arc to start from xb and go to xs
    // In canvas coordinates, if mode=body: xb=0, xs=alpha
    // if mode=stability: xb=-alpha, xs=0
    
    const startAngle = bodyAngle;
    const endAngle = stabAngle;
    
    ctx.beginPath();
    ctx.arc(0, 0, scale * 0.5, startAngle, endAngle, false);
    ctx.strokeStyle = '#7c3aed'; // Purple
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Label alpha
    const midAngle = (startAngle + endAngle) / 2;
    ctx.fillStyle = '#7c3aed';
    ctx.fillText(`α = ${alphaDeg}°`, scale * 0.6 * Math.cos(midAngle), scale * 0.6 * Math.sin(midAngle));
    ctx.restore();
  };

  // Matrix calculation for display
  const cosA = Math.cos(toRad(alpha)).toFixed(3);
  const sinA = Math.sin(toRad(alpha)).toFixed(3);
  const nSinA = (-Math.sin(toRad(alpha))).toFixed(3);

  return (
    <div className="flex flex-col items-center p-6 bg-slate-50 rounded-xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <Plane className="w-6 h-6" />
        機体軸と安定軸の回転変換
      </h2>
      <p className="text-slate-600 mb-6 text-sm text-center">
        航空力学では <strong>Z軸は下向きが正</strong> であることに注意してご覧なさい。
      </p>

      {/* Controls */}
      <div className="flex gap-6 mb-4 w-full justify-center items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-1 w-1/3">
          <label className="text-sm font-semibold text-slate-700 flex justify-between">
            <span>迎角 (α): {alpha}°</span>
          </label>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={alpha}
            onChange={(e) => setAlpha(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('stability')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'stability'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            安定軸(風)固定
          </button>
          <button
            onClick={() => setViewMode('body')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'body'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            機体軸固定
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-white border border-slate-200 rounded-lg shadow-inner overflow-hidden mb-6">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block"
        />
        <div className="absolute top-2 right-2 text-xs text-slate-400 bg-white/80 p-1 rounded">
          Z軸 (下方向)
        </div>
      </div>

      {/* Math Explanation */}
      <div className="w-full bg-slate-900 text-slate-50 p-6 rounded-lg font-mono text-sm leading-relaxed overflow-x-auto">
        <div className="mb-2 text-indigo-300 font-bold border-b border-slate-700 pb-1">
          Rotation Matrix T_sb(α)
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-4">
          <div className="text-center">
            <div className="mb-2 text-slate-400">変換式</div>
            {`v_s = T_sb(α) · v_b`}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">[</span>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-center">
              <span className="text-red-400">{cosA}</span>
              <span className="text-slate-500">0</span>
              <span className="text-blue-400">{sinA}</span>
              
              <span className="text-slate-500">0</span>
              <span className="text-slate-200">1</span>
              <span className="text-slate-500">0</span>
              
              <span className="text-blue-400">{nSinA}</span>
              <span className="text-slate-500">0</span>
              <span className="text-red-400">{cosA}</span>
            </div>
            <span className="text-2xl">]</span>
          </div>
        </div>
        <div className="text-slate-400 text-xs mt-2 border-t border-slate-800 pt-2">
          * cos(α) ≈ {cosA}, sin(α) ≈ {sinA}
          <br/>
          安定軸座標 (xs) = xb·cosα + zb·sinα
          <br/>
          安定軸座標 (zs) = -xb·sinα + zb·cosα
        </div>
      </div>
    </div>
  );
};

export default CoordinateVisualizer;import React, { useState, useEffect, useRef } from 'react';
import { Plane, ArrowRight, Eye, RefreshCw } from 'lucide-react';

const CoordinateVisualizer = () => {
  const [alpha, setAlpha] = useState(15);
  const [viewMode, setViewMode] = useState('stability'); // 'body' or 'stability'
  const canvasRef = useRef(null);

  // Constants
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 150; // pixels per unit
  const vectorLength = 1.2;

  // Degrees to Radians
  const toRad = (deg) => (deg * Math.PI) / 180;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background grid
    drawGrid(ctx);

    // Context setup based on view mode
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Draw axes and aircraft
    drawSystem(ctx, alpha, viewMode);
    
    ctx.restore();
  }, [alpha, viewMode]);

  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY, color, label, isDashed = false) => {
    const headLen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    if (isDashed) ctx.setLineDash([5, 3]);
    else ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = '14px "Noto Sans JP", sans-serif';
    ctx.fillText(label, toX + 10, toY + 10);
  };

  const drawSystem = (ctx, alphaDeg, mode) => {
    const alphaRad = toRad(alphaDeg);
    
    // Rotation logic
    // In 'body' mode: Body axes are fixed (horizontal/vertical), Stability axes rotate
    // In 'stability' mode: Stability axes are fixed, Body axes rotate
    
    let bodyAngle = 0;
    let stabAngle = 0;

    if (mode === 'body') {
      bodyAngle = 0;
      stabAngle = alphaRad; // Stability axis rotates DOWN (positive Z) relative to body if alpha > 0
    } else {
      stabAngle = 0;
      bodyAngle = -alphaRad; // Body axis rotates UP (negative Z) relative to stability if alpha > 0
    }

    // --- Draw Body Axes (Blue) ---
    ctx.save();
    ctx.rotate(bodyAngle);
    
    // x_b axis
    drawArrow(ctx, 0, 0, scale * vectorLength, 0, '#2563eb', 'xb (機体軸)');
    // z_b axis (Down is positive in flight dynamics)
    drawArrow(ctx, 0, 0, 0, scale * vectorLength, '#2563eb', 'zb');

    // Draw Aircraft Silhouette
    ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scale * 0.8, 0); // Nose
    ctx.lineTo(-scale * 0.4, -scale * 0.1); // Tail top
    ctx.lineTo(-scale * 0.4, scale * 0.1); // Tail bottom
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-scale * 0.2, scale * 0.4);
    ctx.stroke();

    ctx.restore();

    // --- Draw Stability Axes (Red) ---
    ctx.save();
    ctx.rotate(stabAngle);
    
    // x_s axis (Velocity Vector direction)
    drawArrow(ctx, 0, 0, scale * vectorLength, 0, '#dc2626', 'xs (安定軸/速度V)', false);
    // z_s axis
    drawArrow(ctx, 0, 0, 0, scale * vectorLength, '#dc2626', 'zs');

    ctx.restore();

    // --- Draw Angle Arc ---
    // Draw arc between xb and xs
    ctx.save();
    // We want the arc to start from xb and go to xs
    // In canvas coordinates, if mode=body: xb=0, xs=alpha
    // if mode=stability: xb=-alpha, xs=0
    
    const startAngle = bodyAngle;
    const endAngle = stabAngle;
    
    ctx.beginPath();
    ctx.arc(0, 0, scale * 0.5, startAngle, endAngle, false);
    ctx.strokeStyle = '#7c3aed'; // Purple
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Label alpha
    const midAngle = (startAngle + endAngle) / 2;
    ctx.fillStyle = '#7c3aed';
    ctx.fillText(`α = ${alphaDeg}°`, scale * 0.6 * Math.cos(midAngle), scale * 0.6 * Math.sin(midAngle));
    ctx.restore();
  };

  // Matrix calculation for display
  const cosA = Math.cos(toRad(alpha)).toFixed(3);
  const sinA = Math.sin(toRad(alpha)).toFixed(3);
  const nSinA = (-Math.sin(toRad(alpha))).toFixed(3);

  return (
    <div className="flex flex-col items-center p-6 bg-slate-50 rounded-xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <Plane className="w-6 h-6" />
        機体軸と安定軸の回転変換
      </h2>
      <p className="text-slate-600 mb-6 text-sm text-center">
        航空力学では <strong>Z軸は下向きが正</strong> であることに注意してご覧なさい。
      </p>

      {/* Controls */}
      <div className="flex gap-6 mb-4 w-full justify-center items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-1 w-1/3">
          <label className="text-sm font-semibold text-slate-700 flex justify-between">
            <span>迎角 (α): {alpha}°</span>
          </label>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={alpha}
            onChange={(e) => setAlpha(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('stability')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'stability'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            安定軸(風)固定
          </button>
          <button
            onClick={() => setViewMode('body')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'body'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            機体軸固定
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-white border border-slate-200 rounded-lg shadow-inner overflow-hidden mb-6">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block"
        />
        <div className="absolute top-2 right-2 text-xs text-slate-400 bg-white/80 p-1 rounded">
          Z軸 (下方向)
        </div>
      </div>

      {/* Math Explanation */}
      <div className="w-full bg-slate-900 text-slate-50 p-6 rounded-lg font-mono text-sm leading-relaxed overflow-x-auto">
        <div className="mb-2 text-indigo-300 font-bold border-b border-slate-700 pb-1">
          Rotation Matrix T_sb(α)
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-4">
          <div className="text-center">
            <div className="mb-2 text-slate-400">変換式</div>
            {`v_s = T_sb(α) · v_b`}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">[</span>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-center">
              <span className="text-red-400">{cosA}</span>
              <span className="text-slate-500">0</span>
              <span className="text-blue-400">{sinA}</span>
              
              <span className="text-slate-500">0</span>
              <span className="text-slate-200">1</span>
              <span className="text-slate-500">0</span>
              
              <span className="text-blue-400">{nSinA}</span>
              <span className="text-slate-500">0</span>
              <span className="text-red-400">{cosA}</span>
            </div>
            <span className="text-2xl">]</span>
          </div>
        </div>
        <div className="text-slate-400 text-xs mt-2 border-t border-slate-800 pt-2">
          * cos(α) ≈ {cosA}, sin(α) ≈ {sinA}
          <br/>
          安定軸座標 (xs) = xb·cosα + zb·sinα
          <br/>
          安定軸座標 (zs) = -xb·sinα + zb·cosα
        </div>
      </div>
    </div>
  );
};

export default CoordinateVisualizer;