var Handlebars = require("handlebars")
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
	template = Handlebars.compile(template)
	return template(data)
}
