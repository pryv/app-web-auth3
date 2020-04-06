import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import Authorization from '@/components/views/Authorization';
import Permissions from '@/components/views/bits/Permissions';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

describe('Authorization.test.js', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Authorization, {
      mocks: {
        $route: {query: {}},
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    });
  });

  it('renders correctly (snapshots matching)', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('deactivates submit button when form is not yet filled', () => {
    const submitButton = wrapper.find('#submitButton');
    expect(wrapper.vm.validForm).toBe(false);
    expect(submitButton.attributes().disabled).toBe('true');
  });

  it('activates submit button when form is valid', async () => {
    wrapper.setData({
      validForm: true,
    });
    await Vue.nextTick();
    const submitButton = wrapper.find('#submitButton');
    expect(submitButton.attributes().disabled).toBeFalsy();
  });

  it('validates required fields correctly', () => {
    const requiredRule = wrapper.vm.rules.required;
    expect(requiredRule()).toBe('This field is required.');
    expect(requiredRule('notEmpty')).toBe(true);
  });

  it('shows authorization form by default', () => {
    // Renders auth form
    const authForm = wrapper.find({ref: 'form'});
    expect(authForm.exists()).toBe(true);
    // Does not render permissions
    const permissions = wrapper.find(Permissions);
    expect(permissions.exists()).toBe(false);
  });

  it('shows requested permissions when app access check is successful', () => {
    wrapper.setData({
      checkedPermissions: [{streamId: 'diary', level: 'read'}],
    });
    // Renders permissions instead
    const permissions = wrapper.find(Permissions);
    expect(permissions.exists()).toBe(true);
  });
});
