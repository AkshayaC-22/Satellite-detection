exports.formatCoordinates = (lat, lng) => {
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };
};

exports.calculateArea = (coordinates) => {
  // Simple implementation for demo
  // In a real application, use proper geospatial calculations
  if (coordinates.length < 3) return 0;
  
  // Using shoelace formula for area calculation
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i].lng * coordinates[j].lat;
    area -= coordinates[j].lng * coordinates[i].lat;
  }
  
  area = Math.abs(area) / 2;
  return area;
};