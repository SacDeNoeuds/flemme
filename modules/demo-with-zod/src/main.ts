import { ensureDefined } from './lib/assert'
import { registrationForm as form, registerInput } from './register-form'
import './style.css'

async function main() {
  registerInput(form, 'username')
  registerInput(form, 'password')
  registerInput(form, 'confirmation')

  const formElement = ensureDefined(document.querySelector('form'), 'Form should be defined')
  const dimmer = ensureDefined(document.querySelector<HTMLElement>('.dimmer'), 'Dimmer should be defined')
  formElement.addEventListener('submit', (event) => {
    event.preventDefault()
    dimmer.style.display = 'block'
    form
      .submit()
      .catch((error) => {
        console.error(error)
        alert(`Submit failed`)
      })
      .finally(() => {
        dimmer.style.display = 'none'
      })
  })
}

main().catch((error) => {
  console.error(error)
})
