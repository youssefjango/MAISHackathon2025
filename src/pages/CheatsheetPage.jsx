import { useParams } from 'react-router-dom'
import cheatsheetImage from '../assets/cheatsheet_placeholder.png'
import '../css/CheatsheetPage.css'

function CheatsheetPage() {
  const { id } = useParams()
  const cheatsheet = { id: 1, title: "Math 101", subject: "Math" }


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