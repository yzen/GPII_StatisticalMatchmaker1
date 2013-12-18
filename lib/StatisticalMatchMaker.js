var fluid = fluid || require("infusion"),
    when = when || require("when");

var gpii = fluid.registerNamespace("gpii"),
	stat = fluid.registerNamespace("gpii.matchMaker.statistical");

stat.match = function (preferences, solutions, strategy) {
	// Statistical MM integration:
	preferences = gpii.matchMaker.statistical.infer(preferences);
	// Transformers:
	return when(gpii.matchMaker.disposeSolutions(preferences, solutions, strategy), function (disposed) {
		var togo = [];
		fluid.each(disposed, function(solrec) {
			if (solrec.disposition === "accept") {
				togo.push(solrec.solution);
			}
		});
		return togo;
	});
};

stat.infer = function (preferences) {
	fluid.each(preferences.applications, function(application){
		if (application.id in stat.data) {
			fluid.each(stat.data[application.id], function(inferer){
				try {
					preferences = stat.setInferred(preferences, application.parameters, inferer.key, inferer.value, inferer.data);
				} catch(err) {
					fluid.log(err);
				}
			});
		};
	});
    return preferences;
};

stat.setInferred = function(preferences, parameters, key, value, data){
	var cur = preferences;
	var splittedKey = key.split(".");
	for (var i=1; i<splittedKey.length; i++) {
		if (splittedKey[i] in cur) {
			if (i == splittedKey.length - 1) {return preferences;};
		} else {
			if (i == splittedKey.length - 1) {
				cur[splittedKey[i]]=eval(value);
				return preferences;
			};
			cur[splittedKey[i]]={};
		};
		cur = cur[splittedKey[i]];
	};
}