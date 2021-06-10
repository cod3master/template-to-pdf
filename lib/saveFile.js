var fs = require("fs")

module.exports = function save(tempFile, filePath, fileName) {
	return new Promise(function (resolve, reject) {
		var exists = fs.existsSync(filePath)
		if (!exists) {
			var mkdirResult = fs.mkdirSync(filePath)
			if (mkdirResult instanceof Error) reject(mkdirResult)
		}
		var fileResult = fs.renameSync(tempFile, filePath + fileName)
		if (fileResult instanceof Error) reject(fileResult)
		resolve(filePath + fileName)
	})
}
