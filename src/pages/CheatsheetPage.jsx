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
        // Fetch both personal and shared cheatsheets from the public/data folder.
        // `sharedCheatsheets.json` exists in `public/data` in this project.
        const [localRes, sharedRes] = await Promise.all([
          fetch('/data/cheatsheets.json'),
          fetch('/data/sharedCheatsheets.json')
        ])

        // If any response isn't ok, treat its data as an empty array so we
        // still show available cheatsheets.
        const localData = localRes && localRes.ok ? await localRes.json() : []
        const sharedData = sharedRes && sharedRes.ok ? await sharedRes.json() : []

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
  // Generic download helper: fetches a resource and triggers a download.
  async function download(url, filename) {
    if (!url) {
      console.warn('No URL provided for download')
      return
    }

    try {
      const res = await fetch(url)
      if (!res.ok) {
        // fallback: open in new tab
        window.open(url, '_blank')
        return
      }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename || url.split('/').pop() || 'download'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    } catch (err) {
      console.error('Download failed, opening in new tab as fallback:', err)
      window.open(url, '_blank')
    }
  }

  // (Docx conversion removed) Only PDF download is supported now.


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
          <button
            className="download-btn pdf"
            onClick={() =>
              download(cheatsheet.pathtopdf, `${cheatsheet.title || 'cheatsheet'}.pdf`)
            }
          >
            PDF
          </button>
          {/* Docx conversion removed — only PDF download is available */}
        </div>
      </div>
    </div>
  )
}

export default CheatsheetPage