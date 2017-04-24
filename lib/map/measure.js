const config = require('../config');
const C = require('../constants');
const index = require('./');

const piDeg = Math.PI / 180.0;
const radiusMiles = 3958.756;
const radiusKm = 6371.0;
const feetPerMeter = 3.28084;
const units = { ENGLISH: 0, METRIC: 1 };
let earthRadius = radiusMiles;
let elevationConversion = feetPerMeter;

/**
 * Total distance between all points
 * @param {number[][]} points
 * @returns {number}
 */
const length = points => points.reduce((total, p, i) => total + ((i > 0) ? pointDistance(points[i - 1], p) : 0), 0);

/**
 * Speed between two points
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 */
function speed(p1, p2) {
   const t = Math.abs(p1[index.TIME] - p2[index.TIME]); // milliseconds
   const d = pointDistance(p1, p2);
   return (t > 0 && d > 0) ? d/(t/C.time.HOUR) : 0;
}

/**
 * @param {number[][]} line
 * @returns {number}
 */
function duration(line) {
   const firstPoint = line[0];
   const lastPoint = line[line.length - 1];
   return (lastPoint[index.TIME] - firstPoint[index.TIME]) / (1000 * 60 * 60);
}

/**
 * Distance between geographic points accounting for earth curvature
 * South latitudes are negative, east longitudes are positive
 * @param {number[]} p1 [longitude, latitude, elevation, time]
 * @param {number[]} p2
 * @returns {number}
 * @see http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
 * @see http://www.geodatasource.com/developers/javascript
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 * @see http://boulter.com/gps/distance/
 *
 * Given φ is latitude radians, λ is longitude radians, R is earth radius:
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2(√a, √(1−a))
 * d = R ⋅ c
 */
function pointDistance(p1, p2) {
   if (sameLocation(p1, p2)) { return 0; }

   const radLat1 = toRadians(p1[index.LAT]);
   const radLat2 = toRadians(p2[index.LAT]);
   const latDistance = toRadians(p2[index.LAT] - p1[index.LAT]);
   const lonDistance = toRadians(p2[index.LON] - p1[index.LON]);
   const a = Math.pow(Math.sin(latDistance / 2), 2)
           + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(lonDistance / 2), 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

   return earthRadius * c;
}

/**
 * Convert degrees to radians
 * @param {number} deg
 */
const toRadians = deg => deg * piDeg;

/**
 * Shortest distance from a point to a segment
 * @param {number[]} p
 * @param {number[]} p1 Line endpoint
 * @param {number[]} p2 Line endpoint
 * @returns {number}
 */
function pointLineDistance(p, p1, p2) {
   let x = p1[index.LON];
   let y = p1[index.LAT];
   let Δx = p2[index.LON] - x;
   let Δy = p2[index.LAT] - y;

   if (Δx !== 0 || Δy !== 0) {
      // non-zero distance
      const t = ((p[index.LON] - x) * Δx + (p[index.LAT] - y) * Δy) / (Δx * Δx + Δy * Δy);

      if (t > 1) {
         x = p2[index.LON];
         y = p2[index.LAT];
      } else if (t > 0) {
         x += Δx * t;
         y += Δy * t;
      }
   }

   Δx = p[index.LON] - x;
   Δy = p[index.LAT] - y;

   return Δx * Δx + Δy * Δy;
}

/**
 * Whether two points are at the same location (disregarding elevation)
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {boolean}
 */
const sameLocation = (p1, p2) => p1[index.LAT] == p2[index.LAT] && p1[index.LON] == p2[index.LON];

// endregion

/**
 * Simplification using Douglas-Peucker algorithm with recursion elimination
 * @param {number[][]} points
 * @returns {number[][]}
 */
function simplify(points) {
   if (config.map.maxPointDeviationFeet <= 0) { return points; }

   const yard = 3;
   const mile = yard * 1760;
   const equatorFeet = mile * radiusMiles;

   const len = points.length;
   const keep = new Uint8Array(len);
   // convert tolerance in feet to tolerance in geographic degrees
   // TODO this is a percent, not degrees
   const tolerance = config.map.maxPointDeviationFeet / equatorFeet;
   let first = 0;
   let last = len - 1;
   const stack = [];
   let maxDistance = 0;
   let distance = 0;
   let index = 0;

   keep[first] = keep[last] = 1;   // keep the end-points

   while (last) {
      maxDistance = 0;

      for (let i = first + 1; i < last; i++) {
         distance = pointLineDistance(points[i], points[first], points[last]);

         if (distance > maxDistance) {
            index = i;
            maxDistance = distance;
         }
      }
      if (maxDistance > tolerance) {
         keep[index] = 1;    // keep the deviant point
         stack.push(first, index, index, last);
      }
      last = stack.pop();
      first = stack.pop();
   }
   return points.filter((p, i) => keep[i] == 1);
}

module.exports = {
   speed,
   length,
   duration,
   toRadians,
   sameLocation,
   pointDistance,
   simplify,
   set unitType(u) {
      if (u == units.ENGLISH) {
         earthRadius = radiusMiles;
         elevationConversion = feetPerMeter;
      } else {
         earthRadius = radiusKm;
         elevationConversion = 1;
      }
   }
};