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

type HostingSelectionItem = {
  value: string,
  text: string,
  description: string,
};

export type HostingSelection = Array<HostingSelectionItem>;

class Hostings {
  regions: HostingRegionList;
  zones : HostingZoneList;
  hostings : HostingList;
  selection: HostingSelection;

  constructor (hostingsData: HostingDefinition) {
    this.selection = [];
    const regions = hostingsData.regions;
    Object.keys(regions).forEach(regionKey => {
      const region = regions[regionKey];
      const zones = region.zones;
      Object.keys(zones).forEach(zoneKey => {
        const zone = zones[zoneKey];
        const hostings = zone.hostings;
        Object.keys(hostings).forEach(hostingKey => {
          const hosting = hostings[hostingKey];
          this.selection.push({
            value: hostingKey,
            text: `${hosting.name} (${region.name} - ${zone.name})`,
            description: hosting.description,
          });
        });
      });
    });
  }

  getSelection (): HostingSelection {
    return this.selection;
  }
}

export default Hostings;
