import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import cheatsheetImage from '../assets/cheatsheet_placeholder.png'
import '../css/CheatsheetPage.css'

function CheatsheetPage() {
  const { id } = useParams()
  const [cheatsheet, setCheatsheet] = useState(null)

  useEffect(() => {
    // Fetch both personal and shared cheatsheets
    async function fetchCheatsheets() {
      try {
        const [localRes, sharedRes] = await Promise.all([
          fetch('/data/cheatsheets.json'),
          fetch('/data/sharedCheatsheets.json'),
        ])

        const [localData, sharedData] = await Promise.all([
          localRes.json(),
          sharedRes.json(),
        ])

        const allCheatsheets = [...localData, ...sharedData]
        const found = allCheatsheets.find(
          (item) => String(item.id) === String(id)
        )

        setCheatsheet(found || null)
      } catch (err) {
        console.error('Error fetching cheatsheet data:', err)
      }
    }

    fetchCheatsheets()
  }, [id])


  if (!cheatsheet) {
    return <h2 className="sheet-not-found">Cheatsheet not found</h2>
  }

  return (
    <div className="sheet-page">
      <div className="sheet-preview">
        <h1>{cheatsheet.title}</h1>
        <img
          src={cheatsheet.image || cheatsheetImage}
          alt={cheatsheet.title}
          className="sheet-image"
        />
        <p className="sheet-description">
          {cheatsheet.description || 'No description available.'}
        </p>

        <div className="download-section">
          <button className="download-btn pdf">PDF</button>
          <button className="download-btn docx">Docx</button>
        </div>
      </div>
    </div>
  )
}

export default CheatsheetPage