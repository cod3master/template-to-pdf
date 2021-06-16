var numeral = require("numeral")

numeral.register("locale", "ch", {
	delimiters: {
		thousands: "’",
		decimal: ".",
	},
	abbreviations: {
		thousand: "k",
		million: "m",
		billion: "b",
		trillion: "t",
	},

	currency: {
		symbol: "",
	},
})
numeral.locale("ch")

var handlebars = require("handlebars")
var helpers = require("handlebars-helpers")({
	handlebars: handlebars,
})

handlebars.registerHelper("formatNumber", function (value) {
	return numeral(parseFloat(value)).format()
})

module.exports = function compileTemplate(options) {
	var data = [].concat(options.templateData)
	var renderedTemplates = []

	data.forEach(function (dataItem, index) {
		dataItem.pageNum = index + 1
		renderedTemplates.push(buildTemplate(options.template, dataItem))
	})

	return renderedTemplates
}

function buildTemplate(template, data) {
	template = handlebars.compile(template)
	return template(data)
}
