/** @babel */

const fs = require('fs-plus')
const path = require('path')

module.exports = {
  setAtomHome: function (homePath) {
    // When a read-writeable .atom folder exists above binary use that on Windows & Linux
    const portableHomePath = path.join(path.dirname(process.execPath), '..', '.atom')
    if (fs.existsSync(portableHomePath)) {
      try {
        fs.accessSync(portableHomePath, fs.R_OK | fs.W_OK)
        process.env.ATOM_HOME = portableHomePath
      } catch (err) {
        // A path exists so it was intended to be used but we didn't have rights, so warn.
        console.log(`Insufficient permission to portable Atom home "${portableHomePath}".`)
      }
    }

    // Check ATOM_HOME environment variable next
    if (process.env.ATOM_HOME !== undefined) {
      return
    }

    // Fall back to default .atom folder in users home folder
    const defaultHomePath = path.join(homePath, '.atom')
    try {
      process.env.ATOM_HOME = fs.realpathSync(defaultHomePath)
    } catch (e) {
      process.env.ATOM_HOME = defaultHomePath
    }
  },

  setUserData: function (app) {
    const electronUserDataPath = path.join(process.env.ATOM_HOME, 'electronUserData')
    if (fs.existsSync(electronUserDataPath)) {
      try {
        fs.accessSync(electronUserDataPath, fs.R_OK | fs.W_OK)
        app.setPath('userData', electronUserDataPath)
      } catch (err) {
        // A path exists so it was intended to be used but we didn't have rights, so warn.
        console.log(`Insufficient permission to Electron user data "${electronUserDataPath}".`)
      }
    }
  }
}
