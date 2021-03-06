var templateCompiler = require("./lib/templateCompiler")
var pdfGenerator = require("./lib/pdfGenerator")
//var saveFile = require("./lib/saveFile")
var validateOptions = require("./lib/validateOptions")
var fs = require("fs")
var logger = console

module.exports = function (options = {}) {
	if (options.logger) {
		logger = options.logger
	}
	return generate
}

function generate(options) {
	return new Promise(function (resolve, reject) {
		var renderedTemplates
		var validityObj = validateOptions(options, logger)
		if (validityObj.valid === false) {
			reject(validityObj.message)
		}

		if (options.html) {
			//logger.info("Rendering html")
			renderedTemplates = options.html
		} else {
			//logger.info("Rendering template")
			renderedTemplates = templateCompiler(options.templateOptions)
		}

		resolve(renderedTemplates)
	})
		.then((renderedTemplates) => {
			var startTime = Date.now()
			//logger.info("Generating PDF:", options.fileName)
			return pdfGenerator(options, renderedTemplates, logger)
				.then(function (tempFile) {
					logger.info("PDF generation done:", tempFile)
					//logger.info("Time spent generating:", Date.now() - startTime)
					return tempFile
				})
				.catch(function (error) {
					logger.error("PDF Generating Error:", error)
					throw error
				})
		})
		.then((tempFile) => {
			//return a buffer
			return new Promise(function (resolve, reject) {
				let buffer

				try {
					buffer = fs.readFileSync(tempFile)
				} catch (e) {
					console.log("readfile failed", e)
					reject(e)
				}
				try {
					fs.unlinkSync(tempFile)
				} catch (e) {
					console.log("unlink failed", e)
					reject(e)
				}

				resolve(buffer)
			})
		})

		.catch(function (error) {
			logger.error("Error:", error)
			throw error
		})
}
