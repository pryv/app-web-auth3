import { shallowMount } from '@vue/test-utils'
import RegisterUser from '../../src/components/RegisterUser'

describe ('RegisterUser.test.js', () => {

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(RegisterUser)
  })

  it('renders correctly (snapshots matching)', () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it('deactivates submit button when form is invalid', () => {
    wrapper.find({name: 'submit'}).element.disabled.toBe(true)
  })

  it('activates submit button when form is valid', () => {

  })

  it('validates email correctly', () => {

  })

  it('validates username correctly', () => {

  })

  it('validates password correctly', () => {

  })

  it('validates password confirmation correctly', () => {

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