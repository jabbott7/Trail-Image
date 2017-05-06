"use strict";$(function(){function t(t){var e=t.point.x,o=t.point.y,n={x:e+C.width-k.width,y:o+C.height-k.height};return n.x=n.x<0?0:n.x+10,n.y=n.y<0?0:n.y+10,e-=n.x,o-=n.y,n.x+n.y>0&&m.panBy([n.x,n.y],{duration:100},{type:null,point:null,target:null,reason:"fit",lngLat:null,originalEvent:null}),{top:o+15,left:e}}function e(t,e,o){t?(S.keyNav=function(t){switch(t.keyCode){case 27:S.mapInteraction();break;case 37:o();break;case 39:e()}},document.addEventListener("keydown",S.keyNav)):document.removeEventListener("keydown",S.keyNav)}function o(t,e){var o=m.getZoom(),i=3*o/Math.pow(2,o),r=[t.lng-i,t.lat-i],a=[t.lng+i,t.lat+i],l=z.features.filter(function(t){var e=t.geometry.coordinates;return e[0]>=r[0]&&e[1]>=r[1]&&e[0]<=a[0]&&e[1]<=a[1]}).map(function(e){return e.properties.distance=n(t,e.geometry.coordinates),e});return l.sort(function(t,e){return t.properties.distance-e.properties.distance}),l.slice(0,e)}function n(t,e){var o=t.lng,n=t.lat,i=e[0],r=e[1];return Math.sqrt(Math.pow(i-o,2)+Math.pow(r-n,2))}function i(){var t=m.getCenter(),e=g+"/map?lat="+t.lat+"&lon="+t.lng+"&zoom="+m.getZoom();window.history.replaceState(null,null,e)}function r(){m.getZoom()>s.zoom&&!x?(x=!0,h.click(function(){m.easeTo(s),util.log.event(u,"Zoom Out")}).removeClass("disabled")):m.getZoom()<=s.zoom&&x&&(x=!1,h.off("click").addClass("disabled"))}function a(t){var e=t.split("/"),o=e[e.length-1].split("_");window.location.href="/"+o[0]}function l(t){m.addSource("track",{type:"geojson",data:t}),m.addLayer({id:"track",type:"line",source:"track",layout:{"line-join":"round","line-cap":"butt"},paint:{"line-color":"#f22","line-width":5,"line-opacity":.7,"line-dasharray":[1,.8]}}),m.fitBounds([post.bounds.sw,post.bounds.ne]),t&&$("#gpx-download").show()}function c(){m.addSource("photos",{type:"geojson",data:z,cluster:!0,clusterMaxZoom:18,clusterRadius:30}),m.addLayer({id:"cluster",type:"circle",source:"photos",filter:["has","point_count"],paint:{"circle-color":"#422","circle-radius":{property:"point_count",type:"interval",stops:[[0,10],[10,12],[100,15]]},"circle-opacity":y,"circle-stroke-width":3,"circle-stroke-color":"#ccc"}}),m.addLayer({id:"cluster-count",type:"symbol",source:"photos",filter:["has","point_count"],layout:{"text-field":"{point_count_abbreviated}","text-font":["Open Sans Bold","Arial Unicode MS Bold"],"text-size":14},paint:{"text-color":"#fff"}}),m.addLayer({id:"photo",type:"circle",source:"photos",filter:["!has","point_count"],paint:{"circle-color":"#f00","circle-radius":7,"circle-stroke-width":4,"circle-stroke-color":"#fdd","circle-opacity":y}}),m.on("mouseenter","cluster",L("pointer")).on("mouseleave","cluster",L()).on("mouseenter","photo",L("pointer")).on("mouseleave","photo",L()).on("zoomend",S.zoomEnd).on("moveend",i).on("click","cluster",S.clusterClick).on("click","photo",S.photoClick)}var s={zoom:6.5,center:[-116.0987,44.7]},u="Map",d=$("#photo-count"),p=$("#photo-preview"),h=$("#zoom-out"),g=post?"/"+post.key:"",f=function(){for(var t=window.location.search.split(/[&\?]/g),e={},o=0;o<t.length;o++){var n=t[o].split("=");2==n.length&&(e[n[0]]=parseFloat(n[1]))}return e.hasOwnProperty("lat")&&e.hasOwnProperty("lon")&&(e.center=[e.lon,e.lat]),e}(),v=new mapboxgl.NavigationControl,m=new mapboxgl.Map({container:"map-canvas",style:"mapbox://styles/"+mapStyle,center:f.center||s.center,zoom:f.zoom||s.zoom,maxZoom:18,dragRotate:!1,keyboard:!1}),w=m.getCanvasContainer(),y=.6,k={width:0,height:0},C={width:322,height:350},x=!1,z=null,b={coordinate:function(t){var e=Math.pow(10,5),o=function(t){return Math.round(t*e)/e};return o(t[1])+", "+o(t[0])},photo:function(t){var e=t.properties,o="Click or tap to enlarge";return $("<figure>").append($("<img>").attr("src",e.url).attr("title",o).attr("alt",o).click(function(){a(e.url)})).append($("<figcaption>").html(this.coordinate(t.geometry.coordinates)))},photoPreview:function(e,o,n,i){p.empty().removeClass().css(t(e)),void 0!==i&&p.append(i),p.addClass(o).append(n).append(util.html.icon("close",S.closePreview)).show({complete:S.previewShown})}},S={zoomEnd:function(){i(),r()},keyNav:null,mapInteraction:function(t){void 0!==t&&"fit"!=t.reason&&S.closePreview()},windowResize:function(){var t=$("canvas");k.width=t.width(),k.height=t.height()},photoClick:function(t){b.photoPreview(t,"single",b.photo(t.features[0])),util.log.event(u,"Click Photo Pin")},previewShown:function(){m.on("move",S.mapInteraction)},closePreview:function(){p.hide(),e(!1),m.off("move",S.mapInteraction)},legendToggle:function(){$(this).parents("ul").toggleClass("collapsed"),util.log.event(u,"Toggle Legend")},clusterClick:function(t){var n=t.features[0].properties,i=m.getZoom(),r=function(){m.easeTo({center:t.lngLat,zoom:18-i<2?18:i+2})};if(n.point_count>20&&i<16)r();else{var a=o(t.lngLat,n.point_count);if(0==a.length)r();else{var l=1,c=$("<div>").addClass("photo-list"),s=$("<div>").addClass("markers"),d=function(t){l+=t,l>a.length?l=1:l<1&&(l=a.length),$("figure",c).hide(),$("i",s).removeClass("selected"),$("figure:nth-child("+l+")",c).show(),$("i:nth-child("+l+")",s).addClass("selected"),util.log.event(u,"Navigate Photo Cluster")},p=function(){d(-1)},h=function(){d(1)};e(!0,h,p);for(var g=0;g<a.length;g++)c.append(b.photo(a[g])),s.append(util.html.icon("place"));$("i:first-child",s).addClass("selected"),b.photoPreview(t,"list",c,$("<nav>").append(util.html.icon("arrow_back",p)).append(s).append(util.html.icon("arrow_forward",h)))}}util.log.event(u,"Click Cluster")}};f.center&&r(),$("#legend .toggle i").click(S.legendToggle),window.addEventListener("resize",S.windowResize),m.addControl(v,"top-right").on("load",function(){$.getJSON("/geo.json",function(t){z=t,d.html(z.features.length+" photos").show(),c(),S.windowResize()}),post.key&&$.getJSON("/"+post.key+"/geo.json",l)});var L=function(t){return void 0===t&&(t=""),function(){w.style.cursor=t}}});var util={setting:{save:function(t,e){window.localStorage&&localStorage.setItem(t,e)},load:function(t){return window.localStorage?localStorage.getItem(t):null}},html:{icon:function(t,e){var o=$("<i>").addClass("material-icons "+t).text(t);return void 0!==e&&o.click(e),o}},log:{event:function(t,e,o){ga("send","event",t,e,o)}}};
//# sourceMappingURL=/js/maps/mapbox.js.map
