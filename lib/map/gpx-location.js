'use strict';

const GPX = require('./gpx-helper.js');
const Geometry = require('./geometry.js');

/**
 *  Location as [longitude, latitude, elevation, time, speed]
 */
class Location {
	/**
	 * Return location as [longitude, latitude, elevation, time, speed]
	 * A degree of latitude is approximately 69 miles
	 * A degree of longitude is about 69 miles at the equater, 0 at the poles
	 * @param {Node|Element} node
	 * @returns {Number[]}
	 * @see http://nationalatlas.gov/articles/mapping/a_latlong.html
	 */
	static parse(node) {
		let location = [GPX.numberAttribute(node, 'lon'), GPX.numberAttribute(node, 'lat')];    // decimal degrees
		let elevation = GPX.firstNode(node, 'ele');                     // meters
		let t = GPX.firstNode(node, 'time');                            // UTC

		// exclude points close to home
		if (GPX.distance(location, config.map.privacyCenter) < config.map.privacyMiles) { return null; }

		if (elevation) {
			let m = parseFloat(GPX.value(elevation));
			location.push(Math.round(m * 3.28084));     // convert meters to whole feet
		}
		if (t) {
			let d = new Date(GPX.value(t));
			location.push(d.getTime());
		}
		// empty speed
		location.push(0);

		return location;
	}

	/**
	 * Distance in miles between geographic points
	 * South latitudes are negative, east longitudes are positive
	 * @param {number[]} p1 [longitude, latitude, elevation, time]
	 * @param {number[]} p2
	 * @return {number}
	 * @see http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
	 * @see http://www.geodatasource.com/developers/javascript
	 */
	static distance(p1, p2) {
		if (Location.same(p1, p2)) { return 0; }

		var theta = p1[Location.longitude] - p2[Location.longitude];
		var d = Math.sin(deg2rad(p1[Location.latitude])) * Math.sin(deg2rad(p2[Location.latitude]))
			+ Math.cos(deg2rad(p1[Location.latitude])) * Math.cos(deg2rad(p2[Location.latitude])) * Math.cos(deg2rad(theta));

		if (d >= -1 && d <= 1) {
			d = Math.acos(d);
			d = rad2deg(d);
			d = d * 60 * 1.1515;    // miles
		} else {
			d = 0;
		}
		return d;
	}

	/**
	 * Whether two points are at the same location (disregarding elevation)
	 * @param {number[]} p1
	 * @param {number[]} p2
	 * @return {Boolean}
	 */
	static same(p1, p2) {
		return p1[Location.latitude] == p2[Location.latitude]
			 && p1[Location.longitude] == p2[Location.longitude];
	}

}

Location.longitude = 0;
Location.latitude = 1;
Location.elevation = 2;
Location.time = 3;
Location.speed = 4;

module.exports = Location;

// - Private static methods ---------------------------------------------------

function deg2rad(deg) { return (deg * Math.PI / 180.0); }
function rad2deg(rad) {	return (rad * 180.0 / Math.PI); }