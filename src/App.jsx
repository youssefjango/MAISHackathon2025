import { useState } from 'react'
import './css/App.css'
import NavBar from './components/NavBar.jsx'
import { Route, Routes } from "react-router-dom"
import Home from './pages/Home.jsx'
import Prev from './pages/Prev.jsx'
import Create from './pages/Create.jsx'

function App() {
  return (
    <>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/prev" element={<Prev />} />
        </Routes>
      </main>
    </>
  )
}

export default App
