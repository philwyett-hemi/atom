/** @babel */

const fs = require('fs-plus')
const path = require('path')

module.exports = function (userHome) {
  // When a read-writeable .atom folder exists above binary use that on Windows & Linux
  if (['linux', 'win32'].includes(process.platform)) {
    const portableHomePath = path.join(path.dirname(process.execPath), '..', '.atom')
    if (fs.existsSync(portableHomePath)) {
      try {
        fs.accessSync(portableHomePath, fs.R_OK | fs.W_OK)
        process.env.ATOM_HOME = portableHomePath
      }
      catch (err) {
        console.log(`Insufficient permission to portable home path "${portableHomePath}".`)
      }
    }
  }

  // Check ATOM_HOME environment variable next
  if (process.env.ATOM_HOME) {
    return
  }

  // Fall back to default .atom folder in users home folder
  const defaultHomePath = path.join(userHome, '.atom')
  try {
    process.env.ATOM_HOME = fs.realpathSync(defaultHomePath)
  } catch (e) {
    process.env.ATOM_HOME = defaultHomePath
  }
}
