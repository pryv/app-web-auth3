// @flow

import axios from 'axios';

const ENDPOINT = 'https://reg.pryv.me/hostings';

type Hosting = {
  url: string,
  name: string,
  description: string,
  localizedDescription: {
    [language: string]: string,
  },
  available: ?boolean
};

type HostingList = {
  [hostingName: string]: Hosting
};

type LocalizedNameList = {
  [language: string]: string,
};

type HostingZone = {
  name: string,
  localizedName: LocalizedNameList,
  hostings: HostingList
};

type HostingZoneList = {
  [zoneName: string]: HostingZone
};

type HostingRegion = {
  name: string,
  localizedName: LocalizedNameList,
  zones: HostingZoneList
};

type HostingRegionList = {
  [regionName: string]: HostingRegion
};

type HostingDefinition = {
  regions: HostingRegionList
};

class Hostings {
  regions: HostingRegionList;
  zones : HostingZoneList;
  hostings : HostingList;

  constructor () {
    this.regions = this.zones = this.hostings = {};
  }

  async syncHostings () {
    const response = await axios.get(ENDPOINT);
    const hostingsData: HostingDefinition = response.data;
    const regions = this.regions = hostingsData.regions;
    Object.keys(regions).forEach(region => {
      const zones = this.zones = regions[region].zones;
      Object.keys(zones).forEach(zone => {
        const hostings = zones[zone].hostings;
        Object.keys(hostings).forEach(hosting => {
          this.hostings[hosting] = hostings[hosting];
        });
      });
    });
  }

  getRegions () {
    return this.regions;
  }

  getZones () {
    return this.zones;
  }

  getHostings () {
    return this.hostings;
  }
}

export default Hostings;
