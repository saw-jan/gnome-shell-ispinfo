/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

import GObject from 'gi://GObject'
import St from 'gi://St'
import Clutter from 'gi://Clutter'
import GLib from 'gi://GLib'

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, 'ISP Indicator')

      this.ip = ''
      this.timerId = null

      let icon = new St.Icon({
        icon_name: 'network-workgroup',
        style_class: 'system-status-icon',
      })
      this.label = new St.Label({
        text: '',
        y_align: Clutter.ActorAlign.CENTER,
      })
      let box = new St.BoxLayout({
        style_class: 'panel-button-box',
        vertical: false,
      })

      box.add_child(icon)
      box.add_child(this.label)

      this.actor.add_child(box)

      let item = new PopupMenu.PopupMenuItem('Refresh')
      item.connect('activate', () => {
        this.searchISP()
        this.startCron()
      })
      this.menu.addMenuItem(item)

      this.searchISP()
      this.startCron()
    }

    getPrivateIP() {
      const [success, out] = GLib.spawn_command_line_sync('hostname -I')

      if (success) {
        return out.toString().trim().split(' ')[0]
      }
      return null
    }

    getISPInfo() {
      const url = 'https://ipinfo.io'
      // timeout 10 seconds, retry 1 time
      const cmd = `wget -q -T 10 -t 1 ${url} -O -`
      const [success, out] = GLib.spawn_command_line_sync(cmd)
      if (success) {
        try {
          return JSON.parse(out.toString())
        } catch (err) {
          return null
        }
      }
      return 1
    }

    searchISP() {
      const currentIP = this.getPrivateIP()
      if (this.ip === currentIP) {
        return
      }

      this.ip = currentIP
      const info = this.getISPInfo()
      if (info && info.org) {
        let idx = info.org.indexOf(' ')
        // remove AS number
        const isp = info.org.substr(idx)
        this.label.text = isp
      } else {
        if (info === 1) {
          this.label.text = 'Error'
        }
        this.label.text = 'Unknown'
      }
    }

    startCron() {
      if (this.timerId !== null) {
        GLib.source_remove(this.timerId)
      }

      this.timerId = GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        60 * 5, // run every 5 minutes
        () => {
          this.searchISP()
          // Return true to keep the timer running
          return true
        }
      )
    }

    destroy() {
      super.destroy()
      if (this.timerId !== null) {
        GLib.source_remove(this.timerId)
        this.timerId = null
      }
    }
  }
)

export default class ISPInfoExtension extends Extension {
  constructor(meta) {
    super(meta)

    this._indicator = null
  }

  /**
   * This function is called when your extension is enabled, which could be
   * done in GNOME Extensions, when you log in or when the screen is unlocked.
   *
   * This is when you should setup any UI for your extension, change existing
   * widgets, connect signals or modify GNOME Shell's behavior.
   */
  enable() {
    this._indicator = new Indicator()
    Main.panel.addToStatusArea(this._uuid, this._indicator)
  }

  /**
   * This function is called when your extension is uninstalled, disabled in
   * GNOME Extensions or when the screen locks.
   *
   * Anything you created, modified or setup in enable() MUST be undone here.
   * Not doing so is the most common reason extensions are rejected in review!
   */
  disable() {
    this._indicator.destroy()
    this._indicator = null
  }
}
