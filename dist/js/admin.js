"use strict";$(function(){function e(e){e.submit(function(){var n="select, button",s=e.find("select"),t=e.find("input[type=checkbox]"),i="true"==e.find("input[name=remove-matches]").val(),c={selected:s.val(),checked:t.length>0?t.checked:!1};return e.find(n).prop("disabled",!0),e.css("cursor","wait"),e.find(".message").hide(),$.post(e.attr("action"),c,function(t){if(e.find(n).prop("disabled",!1),e.css("cursor","auto"),t.success){var c=t.message.split(",");if(i)for(var o=0;o<c.length;o++)s.find('option[value="'+c[o]+'"]').remove();window.alert(c.length>0&&""!=c[0]?"Success:\n"+c.join("\n"):"No new data found")}else e.find(".message").html("Failed").show()}),!1})}e($("#views")),e($("#models"))});