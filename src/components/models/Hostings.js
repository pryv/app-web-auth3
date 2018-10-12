// @flow

type Hosting = {
  url: string,
  name: string,
  description: string,
  localizedDescription: {
    [language: string]: string,
  },
  available: ?boolean
};

export type HostingArray = Array<string>;

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

  parse (hostingsData: HostingDefinition): HostingArray {
    const regions = this.regions = hostingsData.regions;
    Object.keys(regions).forEach(region => {
      this.regions[region] = regions[region];
      const zones = this.zones = regions[region].zones;
      Object.keys(zones).forEach(zone => {
        this.zones[zone] = zones[zone];
        const hostings = zones[zone].hostings;
        Object.keys(hostings).forEach(hosting => {
          this.hostings[hosting] = hostings[hosting];
        });
      });
    });
    return this.getHostings();
  }

  getRegions (): HostingRegionList {
    return this.regions;
  }

  getZones (): HostingZoneList {
    return this.zones;
  }

  getHostings (): HostingArray {
    return Object.keys(this.hostings);
  }
}

export default Hostings;
