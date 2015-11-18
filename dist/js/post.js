!function(t,e,i,o){var n=t(e);t.fn.lazyload=function(r){function a(){var e=0;d.each(function(){var i=t(this);if(!f.skip_invisible||i.is(":visible"))if(t.abovethetop(this,f)||t.leftofbegin(this,f));else if(t.belowthefold(this,f)||t.rightoffold(this,f)){if(++e>f.failure_limit)return!1}else i.trigger("appear"),e=0})}var h,d=this,f={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:e,data_attribute:"original",skip_invisible:!1,appear:null,load:null,placeholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"};return r&&(o!==r.failurelimit&&(r.failure_limit=r.failurelimit,delete r.failurelimit),o!==r.effectspeed&&(r.effect_speed=r.effectspeed,delete r.effectspeed),t.extend(f,r)),h=f.container===o||f.container===e?n:t(f.container),0===f.event.indexOf("scroll")&&h.bind(f.event,function(){return a()}),this.each(function(){var e=this,i=t(e);e.loaded=!1,(i.attr("src")===o||i.attr("src")===!1)&&i.is("img")&&i.attr("src",f.placeholder),i.one("appear",function(){if(!this.loaded){if(f.appear){var o=d.length;f.appear.call(e,o,f)}t("<img />").bind("load",function(){var o=i.attr("data-"+f.data_attribute);i.hide(),i.is("img")?i.attr("src",o):i.css("background-image","url('"+o+"')"),i[f.effect](f.effect_speed),e.loaded=!0;var n=t.grep(d,function(t){return!t.loaded});if(d=t(n),f.load){var r=d.length;f.load.call(e,r,f)}}).attr("src",i.attr("data-"+f.data_attribute))}}),0!==f.event.indexOf("scroll")&&i.bind(f.event,function(){e.loaded||i.trigger("appear")})}),n.bind("resize",function(){a()}),/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)&&n.bind("pageshow",function(e){e.originalEvent&&e.originalEvent.persisted&&d.each(function(){t(this).trigger("appear")})}),t(i).ready(function(){a()}),this},t.belowthefold=function(i,r){var a;return a=r.container===o||r.container===e?(e.innerHeight?e.innerHeight:n.height())+n.scrollTop():t(r.container).offset().top+t(r.container).height(),a<=t(i).offset().top-r.threshold},t.rightoffold=function(i,r){var a;return a=r.container===o||r.container===e?n.width()+n.scrollLeft():t(r.container).offset().left+t(r.container).width(),a<=t(i).offset().left-r.threshold},t.abovethetop=function(i,r){var a;return a=r.container===o||r.container===e?n.scrollTop():t(r.container).offset().top,a>=t(i).offset().top+r.threshold+t(i).height()},t.leftofbegin=function(i,r){var a;return a=r.container===o||r.container===e?n.scrollLeft():t(r.container).offset().left,a>=t(i).offset().left+r.threshold+t(i).width()},t.inviewport=function(e,i){return!(t.rightoffold(e,i)||t.leftofbegin(e,i)||t.belowthefold(e,i)||t.abovethetop(e,i))},t.extend(t.expr[":"],{"below-the-fold":function(e){return t.belowthefold(e,{threshold:0})},"above-the-top":function(e){return!t.belowthefold(e,{threshold:0})},"right-of-screen":function(e){return t.rightoffold(e,{threshold:0})},"left-of-screen":function(e){return!t.rightoffold(e,{threshold:0})},"in-viewport":function(e){return t.inviewport(e,{threshold:0})},"above-the-fold":function(e){return!t.belowthefold(e,{threshold:0})},"right-of-fold":function(e){return t.rightoffold(e,{threshold:0})},"left-of-fold":function(e){return!t.rightoffold(e,{threshold:0})}})}(jQuery,window,document),$(function(){function t(t){var i=$(this),n=a.find("img"),r=i.data("big-loaded"),h=new o(i.data("big-width"),i.data("big-height")),d=function(t){var e="zoom-out";h.update(),h.needsToPan?(e="move",a.on("mousemove",f)):a.off("mousemove",f),f(t),n.css("cursor",e)},f=function(t){n.css({top:h.height.CSS(t.clientY),left:h.width.CSS(t.clientX)})};void 0===r&&(r=!1),r?n.attr("src",i.data("big")):(n.attr("src",i.data("original")),$("<img />").bind("load",function(){n.attr("src",this.src),i.data("big-loaded",!0)}).attr("src",i.data("big"))),n.height(h.height.image).width(h.width.image),d(t),a.show(0,e),$(window).resize(d)}function e(){$("html").css("overflow","hidden")}function i(){$("html").css("overflow","auto"),$(window).off("resize")}function o(t,e){this.width=new n(t),this.height=new n(e),this.needsToPan=!1}function n(t){this.image=parseInt(t),this.window=0,this.extra=0,this.panRatio=0}var r=$("figure"),a=$("#light-box");a.on("click",function(){a.off("mousemove").hide(0,i)}),r.find("img").on("click",t).lazyload(),r.find(".mobile-button").on("click",function(){var t=$(this),e=t.parent();$("<div />").addClass("mobile-info").load(e.data("exif"),function(){t.hide(),$(this).appendTo(e)})}),r.find(".info-button").one("mouseover",function(){var t=$(this);t.addClass("loading").html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>').load(t.parent().data("exif"),function(){t.removeClass("loading").addClass("loaded")})}),n.prototype.update=function(t){this.window=t,this.extra=(this.window-this.image)/2},n.prototype.ratio=function(){return 2*((this.window-this.image)/this.window)},n.prototype.CSS=function(t){var e=this.extra>0?0:(this.window/2-t)*this.panRatio;return(this.extra-e).toFixed(0)+"px"},o.prototype.update=function(){this.height.update(window.innerHeight),this.width.update(window.innerWidth),this.needsToPan=this.width.extra<0||this.height.extra<0,this.needsToPan&&(this.height.panRatio=this.width.panRatio=this.width.extra<this.height.extra&&this.width.extra<0?this.width.ratio():this.height.ratio())}});