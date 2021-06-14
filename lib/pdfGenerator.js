let replaceall = require("replaceall")
let os = require("os")
let Promise = require("bluebird")
let exec = require("child_process").exec
let tempDir = os.tmpdir() + "/"
//+ "/pdfGen" + uuidv4() + "/"
let pexec = Promise.promisify(exec)

let conversion = require("phantom-html-to-pdf")({
	numberOfWorkers: 10,
	timeout: 1000000,
	phantomPath: require("phantomjs2").path,
	tmpDir: tempDir,
})
let logger = console

module.exports = function generatePDF(options, templates, newLogger) {
	logger = newLogger
	templates = [].concat(templates)
	//logger.info("Converting " + options.fileName + " html files to pdfs")
	let startTime = Date.now()
	return Promise.all(templates.map((html, index) => convertToPdf(html, index, options)))
		.then((files) => {
			//console.log("generated pdf files", files)
			//logger.info("Done converting " + options.fileName + " html files")
			//logger.info("Time spent converting " + options.fileName + " html files:", Date.now() - startTime)
			return merge(files, options.fileName, options.pdftkPath)
		})
		.catch(function (error) {
			logger.error("Error generating pdf:", error)
			throw error
		})
}

function convertToPdf(html, index, options) {
	return new Promise((resolve, reject) => {
		conversion({ html: html, paperSize: options.pdfOptions }, function (err, pdf) {
			if (err) {
				reject(err)
				return
			}

			resolve(pdf.stream.path)
		})
	}).catch(function (error) {
		logger.error("Conversion Error on file " + options.fileName + ":", error)
		throw error
	})
}

//merge pdfs
function merge(files, fileName, pdftkPath = "pdftk") {
	//logger.info("Merging files")

	let pdfFiles = files.join(" ")
	let htmlFiles = replaceall(".pdf", "html.html", pdfFiles)
	let tempMergedPath = tempDir + fileName
	let params = [pdftkPath, pdfFiles, "cat output", tempMergedPath].join(" ")
	let startTime = Date.now()
	return pexec(params)
		.then(() => {
			//logger.info("Merge done, now removing temporary files")
			return pexec("rm " + pdfFiles + " " + htmlFiles) //del
		})
		.then(() => {
			//logger.info("Temporary files removed")
			return tempMergedPath //final pdf path
		})
		.catch((error) => {
			logger.error("Could not merge pdf:", error)
			throw error
		})
		.finally(() => {
			//logger.info("Time spent merging files:", Date.now() - startTime)
		})
}
