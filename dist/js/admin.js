"use strict";$(function(){function e(e){e.submit(function(){var n=e.find("select"),t=e.find("input[name=include-related]"),s="true"==e.find("input[name=remove-matches]").val(),i={selected:n.val(),includeRelated:t.length>0&&t.is(":checked")};return e.find("select, button").prop("disabled",!0),e.css("cursor","wait"),e.find(".message").hide(),$.post(e.attr("action"),i,function(t){if(e.find("select, button").prop("disabled",!1),e.css("cursor","auto"),t.success){var i=t.message.split(",");if(s)for(var a=0;a<i.length;a++)n.find('option[value="'+i[a]+'"]').remove();window.alert(i.length>0&&""!=i[0]?"Keys Affected:\n"+i.join("\n"):"No new data found")}else e.find(".message").html("Failed").show()}),!1})}e($("#json")),e($("#library")),e($("#views")),e($("#maps"))});
//# sourceMappingURL=/js/maps/admin.js.map
