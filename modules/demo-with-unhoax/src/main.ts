import { ensureDefined } from './lib/assert'
import { form, registerInput } from './registration-form'
import './style.css'

async function main() {
  registerInput('username')
  registerInput('password')
  registerInput('confirmation')

  const formElement = ensureDefined(document.querySelector('form'), 'Form should be defined')
  const dimmer = ensureDefined(document.querySelector<HTMLElement>('.dimmer'), 'Dimmer should be defined')
  const formErrorsElement = ensureDefined(document.querySelector<HTMLElement>('#form-errors'), 'no form errors element')

  formElement.addEventListener('submit', (event) => {
    event.preventDefault()
    formErrorsElement.textContent =
      form.errors?.map((error) => `- ${[error.path, error.message].filter(Boolean).join(': ')}`).join('\n') ?? ''

    if (!form.isValid) return
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
