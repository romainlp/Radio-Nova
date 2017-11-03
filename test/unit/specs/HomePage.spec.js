import Vue from 'vue'
import HomePage from '@/components/HomePage'

describe('HomePage.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(HomePage)
    }).$mount()

    expect(vm.$el.querySelector('h1').textContent).to.contain('...')
    expect(vm.$el.querySelector('h2').textContent).to.contain('...')
  })
})
