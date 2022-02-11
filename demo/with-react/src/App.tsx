import './App.css'
import { RegisterForm } from './RegisterForm/Component'

function App() {
  return (
    <div className="app">
      <h2>Registration form</h2>
      <p>
        Build with <a href="https://reactjs.org/">React</a> and <a href="https://docs.superstructjs.org/">superstruct</a> 😉
      </p>
      <RegisterForm />
    </div>
  )
}

export default App
