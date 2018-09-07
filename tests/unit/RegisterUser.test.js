import { shallowMount, createLocalVue } from '@vue/test-utils'
import RegisterUser from '../../src/components/RegisterUser'
import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

describe ('RegisterUser.test.js', () => {

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(RegisterUser)
  })

  it('renders correctly (snapshots matching)', () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it('deactivates submit button when form is not yet filled', () => {
    const submitButton = wrapper.find('#submitButton')
    expect(wrapper.vm.validForm).toBe(false)
    expect(submitButton.attributes().disabled).toBe("true")
  })

  it('activates submit button when form is valid', () => {
    wrapper.setData({
      validForm: true
    })
    const submitButton = wrapper.find('#submitButton')
    expect(submitButton.attributes().disabled).toBeFalsy()
  })

  it('validates email correctly', () => {
  })

  it('validates username correctly', () => {
  })

  it('validates hosting correctly', () => {

  })

  it('contains a valid link to terms of use', () => {

  })

  it('clears the form when clicking on clear button', () => {

  })

  it('redirects to auth view when clicking on sign in button', () => {

  })

})