import { useState } from 'react'
import './css/App.css'
import NavBar from './components/NavBar.jsx'
import { Route, Routes } from "react-router-dom"
import Home from './pages/Home.jsx'
import Cheatsheets from './pages/Cheatsheets.jsx'
import Create from './pages/Create.jsx'
import CheatsheetPage from './pages/CheatsheetPage.jsx'

function App() {
  return (
    <>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/cheatsheets" element={<Cheatsheets />} />
          <Route path="/sheet/:id" element={<CheatsheetPage />} />

        </Routes>
      </main>
    </>
  )
}

export default App
