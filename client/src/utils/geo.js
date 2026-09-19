// Ray-casting algorithm for Point in Polygon
export function booleanPointInPolygon(point, polygon) {
  if (!polygon) return false;

  const [lng, lat] = point;

  const checkRing = (ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  if (polygon.type === 'Polygon') {
    if (!checkRing(polygon.coordinates[0])) return false;
    for (let i = 1; i < polygon.coordinates.length; i++) {
      if (checkRing(polygon.coordinates[i])) return false;
    }
    return true;
  } else if (polygon.type === 'MultiPolygon') {
    for (const poly of polygon.coordinates) {
      if (checkRing(poly[0])) {
        let inHole = false;
        for (let i = 1; i < poly.length; i++) {
          if (checkRing(poly[i])) inHole = true;
        }
        if (!inHole) return true;
      }
    }
  }

  return false;
}
