/* global describe, it, beforeEach, expect */

import { shallowMount } from '@vue/test-utils';
import Password from '../../src/components/Password';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

describe('RegisterUser.test.js', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Password);
  });

  it('renders correctly (snapshots matching)', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('asks only for password by default', () => {
    const password = wrapper.find('#password');
    expect(password.exists()).toBe(true);
    const confirmation = wrapper.find('#passConfirmation');
    expect(confirmation.exists()).toBe(false);
  });

  it('asks for password and confirmation if needed', () => {
    wrapper = shallowMount(Password, {
      propsData: {
        confirmation: true
      }
    });
    const password = wrapper.find('#password');
    expect(password.exists()).toBe(true);
    const confirmation = wrapper.find('#passConfirmation');
    expect(confirmation.exists()).toBe(true);
  });

  it('validates password correctly', () => {
    const requiredRule = wrapper.vm.rules.required;
    expect(requiredRule()).toBe('Password is required.');
    expect(requiredRule('notEmpty')).toBe(true);
  });

  it('validates password confirmation correctly', () => {
    wrapper.setData({
      password: '1234',
      repass: '1234'
    });
    expect(wrapper.vm.matchPassword).toBe(true);
    wrapper.setData({
      password: '1234',
      repass: '4321'
    });
    expect(wrapper.vm.matchPassword).toBe('Password confirmation does not match.');
  });
});
