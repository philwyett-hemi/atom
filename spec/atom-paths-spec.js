/** @babel */

import {it, fit, ffit, fffit, beforeEach, afterEach} from './async-spec-helpers'
import {app} from 'remote'
import atomPaths from '../src/atom-paths'
import fs from 'fs-plus'
import path from 'path'
const temp = require('temp').track()

describe("AtomPaths", () => {
  const portableAtomHomePath = path.join(path.dirname(process.execPath), '..', '.atom')

  afterEach(() => {
    atomPaths.setAtomHome(app.getPath('home'))
  })

  describe('SetAtomHomePath', () => {
    describe('when a portable .atom folder exists', () => {
      beforeEach(() => {
        delete process.env.ATOM_HOME
        fs.mkdirSync(portableAtomHomePath)
      })

      afterEach(() => {
        delete process.env.ATOM_HOME
        fs.removeSync(portableAtomHomePath)
      })

      it('sets ATOM_HOME to the portable .atom folder if it has permission', () => {
        atomPaths.setAtomHome(app.getPath('home'))
        expect(process.env.ATOM_HOME).toEqual(portableAtomHomePath)
      })

      it('leaves ATOM_HOME if no write access to portable .atom folder', () => {
        if (process.platform === 'win32') return

        process.env.ATOM_HOME = process.env.TEMP
        fs.chmodSync(portableAtomHomePath, 444)
        atomPaths.setAtomHome(app.getPath('home'))
        fs.chmodSync(portableAtomHomePath, 666)
        expect(process.env.ATOM_HOME).toEqual(process.env.TEMP)
      })
    })

    describe('when a portable folder does not exist', () => {
      beforeEach(() => {
        delete process.env.ATOM_HOME
        fs.removeSync(portableAtomHomePath)
      })

      afterEach(() => {
        delete process.env.ATOM_HOME
      })

      it('leaves ATOM_HOME unmodified if it was already set', () => {
        const temporaryHome = temp.mkdirSync('atom-spec-setatomhomepath')
        process.env.ATOM_HOME = temporaryHome
        atomPaths.setAtomHome(app.getPath('home'))
        expect(process.env.ATOM_HOME).toEqual(temporaryHome)
      })

      it('sets ATOM_HOME to a default location if not yet set', () => {
        const expectedPath = path.join(app.getPath('home'), '.atom')
        atomPaths.setAtomHome(app.getPath('home'))
        expect(process.env.ATOM_HOME).toEqual(expectedPath)
      })
    })
  })

  describe('setUserData', () => {
    let tempAtomHomePath = null
    let electronUserDataPath = null
    let defaultElectronUserDataPath = null

    beforeEach(() => {
      defaultElectronUserDataPath = app.getPath('userData')
      delete process.env.ATOM_HOME
      tempAtomHomePath = temp.mkdirSync('atom-paths-specs-atom-home')
      tempAtomConfigPath = path.join(tempAtomHomePath, '.atom')
      fs.mkdirSync(tempAtomConfigPath)
      electronUserDataPath = path.join(tempAtomConfigPath, 'electronUserData')
      atomPaths.setAtomHome(tempAtomHomePath)
    })

    afterEach(() => {
      delete process.env.ATOM_HOME
      fs.removeSync(electronUserDataPath)
      temp.cleanupSync()
      app.setPath('userData', defaultElectronUserDataPath)
    })

    describe('when an electronUserData folder exists', () => {
      it('sets userData path to the folder if it has permission', () => {
        fs.mkdirSync(electronUserDataPath)
        atomPaths.setUserData(app)
        expect(app.getPath('userData')).toEqual(electronUserDataPath)
      })

      it('leaves userData unchanged if no write access to electronUserData folder', () => {
        if (process.platform === 'win32') return

        fs.mkdirSync(electronUserDataPath)
        fs.chmodSync(electronUserDataPath, 444)
        atomPaths.setUserData(app)
        fs.chmodSync(electronUserDataPath, 666)
        expect(app.getPath('userData')).toEqual(defaultElectronUserDataPath)
      })
    })

    describe('when an electronUserDataPath folder does not exist', () => {
      it('leaves userData app path unchanged', () => {
        atomPaths.setUserData(app)
        expect(app.getPath('userData')).toEqual(defaultElectronUserDataPath)
      })
    })
  })
})
