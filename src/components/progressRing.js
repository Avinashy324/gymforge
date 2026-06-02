export function createProgressRing(percentage, size = 120, strokeWidth = 8, color = 'var(--accent-orange)') {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const container = document.createElement('div');
  container.className = 'progress-ring-container';
  container.style.cssText = `width:${size}px;height:${size}px;position:relative;`;

  container.innerHTML = `
    <svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="var(--bg-tertiary)" stroke-width="${strokeWidth}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" 
        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        style="transition:stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)"/>
    </svg>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column">
      <span style="font-size:${size * 0.22}px;font-weight:700;color:var(--text-primary);font-family:var(--font-heading)">${Math.round(percentage)}%</span>
    </div>
  `;

  return container;
}

export function createMacroRing(value, max, label, color, unit = 'g') {
  const percentage = Math.min((value / max) * 100, 100);
  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const container = document.createElement('div');
  container.className = 'macro-item';
  container.innerHTML = `
    <div class="macro-ring" style="width:${size}px;height:${size}px;position:relative">
      <svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="var(--bg-tertiary)" stroke-width="${strokeWidth}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" 
          stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          style="transition:stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)"/>
      </svg>
      <div class="macro-value" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text-primary)">${value}${unit}</div>
    </div>
    <span class="macro-label" style="font-size:10px;color:var(--text-secondary);text-transform:uppercase">${label}</span>
  `;
  return container;
}
