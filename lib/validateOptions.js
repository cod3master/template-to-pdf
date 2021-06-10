module.exports = function validateOptions(options, logger) {
	var isValid = { valid: true }

	if (typeof options !== "object" || options === null) {
		isValid.message = "Config param required"
		isValid.valid = false
	}
	if (typeof options.fileName !== "string") {
		isValid.message = "File Name param is required"
		isValid.valid = false
	}

	if (options.fileName) {
		if (!options.fileName.includes(".pdf")) {
			isValid.message = "File Name param must inlcude .pdf extension"
			isValid.valid = false
		}
	}

	if (options.html === undefined && options.templateOptions === undefined) {
		isValid.message = "Html or Template is required"
		isValid.valid = false
	}

	// TODO add better checking for html
	if (options.html !== undefined && options.templateOptions !== undefined) {
		isValid.message = "Cannot have both Html and Template"
		isValid.valid = false
	}

	if (options.templateOptions !== undefined) {
		if (typeof options.templateOptions.templateData !== "object" || options.templateOptions.templateData === null) {
			isValid.message = "Template Data is required when using Template"
			isValid.valid = false
		}
		if (typeof options.templateOptions.templateType !== "string" || options.templateOptions.templateType === "") {
			isValid.message = "Template Type is required when using Template.  Valid options are handlebars, haml, pug, mustache, ejs"
			isValid.valid = false
		}

		if (typeof options.templateOptions.template !== "string" || options.templateOptions.template === "") {
			isValid.message = "Template is required when using Template"
			isValid.valid = false
		}
	}

	if (options.filePath !== undefined) {
		if (!options.filePath.endsWith("/")) {
			isValid.message = "filePath must be absolute. I.E. i/am/absolute/"
			isValid.valid = false
		}
	}

	return isValid
}
