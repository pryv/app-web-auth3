/* global describe, it, expect */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import NavigationButton from '@/components/views/bits/NavigationButton';
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';

Vue.use(Vuetify);

describe('NavigationButton.test.js', () => {
  it('renders correctly (snapshots matching)', () => {
    const wrapper = shallowMount(NavigationButton);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('has the correct title and goes to the correct page', () => {
    const title = 'buttonTitle';
    const page = 'pageId';
    const newPath = '/' + page;
    const localVue = createLocalVue();
    localVue.use(VueRouter);
    const router = new VueRouter();
    const wrapper = mount(NavigationButton, {
      propsData: {
        title: title,
        page: page,
      },
      localVue,
      router,
    });
    const button = wrapper.find('#navButton');
    expect(button.text()).toBe(title);
    expect(wrapper.vm.$route.path).toBe('/');
    button.trigger('click');
    expect(wrapper.vm.$route.path).toBe(newPath);
  });
});
