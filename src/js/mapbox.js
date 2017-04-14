'use strict';

var map = new mapboxgl.Map({
    container: 'map-canvas',
    style: 'mapbox://styles/mapbox/satellite-streets-v9'
});

map.on('load', function() {
   // map.addLayer({
   //    id: 'photos',
   //    type: 'symbol',
   //    source: {
   //       type: 'geojson',
   //       data: 'http://localhost:3000/geo.json'
   //    },
   //    layout: {
   //       "text-field": "{title}",
   //       "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
   //       "text-offset": [0, 0.6],
   //       "text-anchor": "top"
   //    }
   // });
   map.addSource('photos', {
      type: 'geojson',
      data: 'http://localhost:3000/geo.json',
      cluster: true,
      clusterMaxZoom: 15,
      clusterRadius: 20
   });

   map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'photos',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': {
                property: "point_count",
                type: 'interval',
                stops: [
                    [0, "#51bbd6"],
                    [100, "#f1f075"],
                    [750, "#f28cb1"],
                ]
            },
            'circle-radius': {
                property: "point_count",
                type: "interval",
                stops: [
                    [0, 20],
                    [100, 30],
                    [750, 40]
                ]
            }
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'photos',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'photos',
        filter: ["!has", "point_count"],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff' 
        }
    });
})