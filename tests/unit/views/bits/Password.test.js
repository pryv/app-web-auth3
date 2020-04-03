import { shallowMount } from '@vue/test-utils';
import Password from '@/components/views/bits/Password';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

describe('Password.test.js', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Password);
  });

  it('renders correctly (snapshots matching)', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('asks only for password by default', () => {
    // Renders password
    const password = wrapper.find('#password');
    expect(password.exists()).toBe(true);
    // Does not render password confirmation
    const confirmation = wrapper.find('#passConfirmation');
    expect(confirmation.exists()).toBe(false);
  });

  it('asks for password and confirmation if needed', async () => {
    wrapper.setProps({
      confirmation: true,
    });
    await Vue.nextTick();
    // Renders password
    const password = wrapper.find('#password');
    expect(password.exists()).toBe(true);
    // Also renders password confirmation
    const confirmation = wrapper.find('#passConfirmation');
    expect(confirmation.exists()).toBe(true);
  });

  it('validates password correctly', () => {
    const requiredRule = wrapper.vm.rules.required;
    expect(requiredRule()).toBe('Password is required.');
    expect(requiredRule('notEmpty')).toBe(true);
  });

  it('validates password confirmation correctly', () => {
    wrapper.setProps({
      value: '1234',
    });
    wrapper.setData({
      repass: '1234',
    });
    // Password confirmation matches
    expect(wrapper.vm.matchPassword).toBe(true);
    wrapper.setProps({
      value: '1234',
    });
    wrapper.setData({
      repass: '4321',
    });
    // Password confirmation does not match
    expect(wrapper.vm.matchPassword).toBe('Password confirmation does not match.');
  });
});
