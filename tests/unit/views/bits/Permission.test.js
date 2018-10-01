import { shallowMount } from '@vue/test-utils';
import Permissions from '@/components/views/bits/Permissions';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

describe('Permissions.test.js', () => {
  let wrapper;
  const appId = 'testApp';
  const permissions = [
    {streamId: 'diary', level: 'read'},
    {streamId: 'work', level: 'manage'},
  ];

  beforeAll(() => {
    wrapper = shallowMount(Permissions, {
      propsData: {
        permissionsArray: permissions,
        appId: appId,
        accept: () => {},
        refuse: () => {},
      },
    });
  });

  it('renders correctly (snapshots matching)', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('shows the id of the requesting app', () => {
    const appIdText = wrapper.find('#appIdText');
    expect(appIdText.html()).toContain(`App <b>${appId}</b> is requesting:`);
  });

  it('shows a list of all requested permissions', () => {
    const list = wrapper.find('ul').html();
    permissions.forEach(permission => {
      expect(list).toContain(`A permission on stream <b>${permission.streamId}</b> with level <b>${permission.level}</b></li>`);
    });
  });
});
