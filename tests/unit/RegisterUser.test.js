/* global describe, it, beforeEach, expect */

import { shallowMount } from '@vue/test-utils';
import RegisterUser from '@/components/views/RegisterUser';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

describe('RegisterUser.test.js', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(RegisterUser);
  });

  it('renders correctly (snapshots matching)', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('deactivates submit button when form is not yet filled', () => {
    const submitButton = wrapper.find('#submitButton');
    expect(wrapper.vm.validForm).toBe(false);
    expect(submitButton.attributes().disabled).toBe('true');
  });

  it('activates submit button when form is valid', () => {
    wrapper.setData({
      validForm: true
    });
    const submitButton = wrapper.find('#submitButton');
    expect(submitButton.attributes().disabled).toBeFalsy();
  });

  it('validates email correctly', () => {
    const emailRule = wrapper.vm.rules.email;
    expect(emailRule('invalidEmail')).toBe('E-mail must be valid.');
    expect(emailRule('validEmail@test.com')).toBe(true);
  });

  it('validates required fields correctly', () => {
    const requiredRule = wrapper.vm.rules.required;
    expect(requiredRule()).toBe('This field is required.');
    expect(requiredRule('notEmpty')).toBe(true);
  });
});
