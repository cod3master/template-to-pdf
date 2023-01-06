const templateCompiler = require('./lib/templateCompiler')
const pdfGenerator = require('./lib/pdfGenerator')
const validateOptions = require('./lib/validateOptions')
const fs = require('fs')
const path = require('path')
const logger = console
const cheerio = require('cheerio')
const translate = require('../../scripts/deepl')

module.exports = function (options = {}) {
	if (options.logger) {
		logger = options.logger
	}
	return generate
}

function generate(options) {
	return new Promise(async function (resolve, reject) {
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

		if (options.language != 'de') {
			let renderedTemplate = renderedTemplates[0]
			const $ = cheerio.load(renderedTemplate)

			let tSources = []
			$('t').each(function () {
				let t = $(this).html()
				tSources.push(t)
			})

			//console.log('tSources', tSources)

			let translations = {}
			for (let t of tSources) {
				let r = await translate(t, options.language, 'de')
				translations[t] = r
			}
			//console.log('translations', translations)

			$('t').each(function () {
				let t = $(this).html() // get original
				let r = translations[t]
				console.log(t, r)
				$(this).text(r) //replace with translation
			})

			renderedTemplates[0] = $.html() // convert cheerio dom back to html
		}

		resolve(renderedTemplates)
	})
		.then((renderedTemplates) => {
			//logger.info("Generating PDF:", options.fileName)
			return pdfGenerator(options, renderedTemplates, logger)
				.then(function (tempFile) {
					logger.info('PDF generation done:', tempFile)
					//logger.info("Time spent generating:", Date.now() - startTime)
					return tempFile
				})
				.catch(function (error) {
					logger.error('PDF Generating Error:', error)
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
					console.log('readfile failed', e)
					reject(e)
				}
				try {
					fs.unlinkSync(tempFile)
				} catch (e) {
					console.log('unlink failed', e)
					reject(e)
				}

				resolve(buffer)
			})
		})

		.catch(function (error) {
			logger.error('Error:', error)
			throw error
		})
}
