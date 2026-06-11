import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import RegisterUser from '@/components/views/RegisterUser';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

describe('RegisterUser.test.js', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(RegisterUser, {
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

  it('treats email as optional (no email rule — a random one is generated when empty)', () => {
    expect(wrapper.vm.rules.email).toBeUndefined();
  });

  it('validates required fields correctly', () => {
    const requiredRule = wrapper.vm.rules.required;
    expect(requiredRule()).toBe('This field is required.');
    expect(requiredRule('notEmpty')).toBe(true);
  });
});
