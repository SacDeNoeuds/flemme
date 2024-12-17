import './App.css'
import { sleep } from './lib/sleep'
import { RegisterForm } from './RegisterForm/Component'

function App() {
  return (
    <div className="app">
      <h2>Registration form</h2>
      <p>
        Build with <a href="https://reactjs.org/">React</a> and{' '}
        <a href="https://sacdenoeuds.github.io/unhoax/">unhoax</a> 😉
      </p>
      <RegisterForm
        onRegister={async (values) => {
          await sleep(750)
          console.info('submitted:', values)
        }}
      />
    </div>
  )
}

export default App
