export function colorWithOpacity(hex: string, opacity = 100): string {
  const value = /^#[\da-f]{6}$/i.test(hex) ? hex : '#ffffff';
  const red = Number.parseInt(value.slice(1, 3), 16);
  const green = Number.parseInt(value.slice(3, 5), 16);
  const blue = Number.parseInt(value.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(100, opacity)) / 100})`;
}

export function pageBackground(hex = '#ffffff', opacity = 100): string {
  const value = /^#[\da-f]{6}$/i.test(hex) ? hex : '#ffffff';
  const alpha = Math.max(0, Math.min(100, opacity)) / 100;
  const channels = [1, 3, 5].map((index) => Math.round(255 * (1 - alpha) + Number.parseInt(value.slice(index, index + 2), 16) * alpha));
  return `rgb(${channels.join(', ')})`;
}
