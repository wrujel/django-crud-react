import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import TasksPage from './pages/TasksPage'
import TasksFormPage from './pages/TasksFormPage'
import Navigation from './components/Navigation'
import {Toaster} from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
      <div className='container max-w-xl mx-auto'>
        <Navigation/>
        <Routes>
          <Route path='/'/>
          <Route path='/tasks' element={<TasksPage/>}/>
          <Route path='/tasks-create' element={<TasksFormPage/>}/>
          <Route path='/tasks/:id' element={<TasksFormPage/>}/>
        </Routes>
        <Toaster position="bottom-right" reverseOrder={false}/>
      </div>
    </BrowserRouter>
  )
}

export default App
