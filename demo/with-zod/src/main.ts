import './style.css'
import { register, registerForm, registerInput } from './register-form'
import { ensureDefined } from './lib/assert'

async function main() {
  const form = registerForm()
  registerInput(form, 'username')
  registerInput(form, 'password')
  registerInput(form, 'confirmation')

  const formElement = ensureDefined(document.querySelector('form'), 'Form should be defined')
  const dimmer = ensureDefined(document.querySelector<HTMLElement>('.dimmer'), 'Dimmer should be defined')
  formElement.addEventListener('submit', (event) => {
    event.preventDefault()
    dimmer.style.display = 'block'
    form
      .submit(register)
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
