import Broadcast from './Broadcast.js';
import BvhStream from './bvh/BvhStream.js';
import WebInterface from './WebInterface.js';

import { BehaviorSubject } from 'rxjs';

export default class GoldStreamer {
  constructor(settings) {
    this.settings = settings;
    this.sources = new BehaviorSubject([]);
    this.initNetwork();
    this.initUpdate();
  }

  initNetwork() {
    /* initialise networking components */
    const { sources, settings } = this;
    this.web = new WebInterface({ sources, settings });
    this.broadcastFor = new Broadcast({ sources, settings });
    this.broadcastFor.osc = {};
    this.broadcastFor.ws = {};
    const bvhStream = new BvhStream({ sources, settings });
  }

  initUpdate() {
    /* stick to a good update-rate of 50 fps if possible (freq.update value=20) */
    setInterval(this.update.bind(this), this.settings.get.general.freq.update);
    /**
     * the second interval takes care of
     * broadcasting message. here however we
     * throttle broadcasting messages a bit, so
     * that we only have to update every tenth
     * of a second (or less or more?).
     * this is to prevent the network or receiver
     * from overloading.
     */
    setInterval(this.broadcast.bind(this), this.settings.get.general.freq.broadcast);
  }

  update() {
    this.sources.value.forEach((body) => body.update());
  }

  broadcast() {
    /** broadcast to the web */
    this.web.publish(this.settings);
    /** broacast to OSC channels */
    this.broadcastFor.osc.publish(this.settings);
  }
}
