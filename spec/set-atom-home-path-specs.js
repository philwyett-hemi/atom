/** @babel */

import {it, fit, ffit, fffit, beforeEach, afterEach} from './async-spec-helpers'
import setAtomHomePath from '../src/set-atom-home-path'
import {app} from 'electron'
import fs from 'fs-plus'
import temp from 'temp'
import path from 'path'

describe('SetAtomHomePath', () => {

  describe('when a portable .atom folder exists', () => {
    if (process.platform === 'darwin') return

    const portableAtomHomePath = path.join(path.basename(process.execPath), '..', '.atom')

    beforeEach(() => {
      fs.mkdirSync(portableAtomHomePath)
    })

    afterEach(() => {
      fs.removeSync(portableAtomHomePath)
      process.env.ATOM_HOME = null
    })

    it('sets ATOM_HOME to the portable .atom folder if it has permission', () => {
      setAtomHomePath(app.getPath('home'))
      expect(process.env.ATOM_HOME).toEqual(portableAtomHomePath)
    })

    it('leaves ATOM_HOME if no write access to portable .atom folder', () => {
      process.env.ATOM_HOME = process.env.TEMP
      fs.chmodSync(portableAtomHomePath, 444)
      setAtomHomePath(app.getPath('home'))
      fs.chmodSync(portableAtomHomePath, 666)
      expect(process.env.ATOM_HOME).toEqual(process.env.TEMP)
    })
  })

  describe('when a portable folder does not exist', () => {

    afterEach(() => {
      process.env.ATOM_HOME = null
    })

    it('leaves ATOM_HOME unmodified if it was already set', () => {
      const temporaryHome = temp.mkdirSync('atom-spec-setatomhomepath')
      process.env.ATOM_HOME = temporaryHome
      SetAtomHomePath(app.getPath('home'))
      expect(process.env.ATOM_HOME).toEqual(temporaryHome)
    })

    it('sets ATOM_HOME to a default location if not yet set', () => {
      process.env.ATOM_HOME = null
      const expectedPath = path.realpathSync(path.join(process.env.HOME, '.atom'))
      SetAtomHomePath(app.getPath('home'))
      expect(process.env.ATOM_HOME).toEqual(expectedPath)
    })
  })
})
