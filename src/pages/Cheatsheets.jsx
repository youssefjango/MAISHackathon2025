import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CheatsheetCard from '../components/CheatsheetCard'
import '../css/Cheatsheets.css'

function Cheatsheets() {
    const [cheatsheets, setCheatsheets] = useState([])
  const [sharedCheatsheets, setSharedCheatsheets] = useState([])

  useEffect(() => {
    // Fetch both JSON files from /public/data/
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

        setCheatsheets(localData)
        setSharedCheatsheets(sharedData)
      } catch (err) {
        console.error('Error loading cheatsheets:', err)
      }
    }

    fetchCheatsheets()
  }, [])

    function handleDeleteCheatsheet(cheatsheetId) {
        const cheatsheet = cheatsheets.find(c => c.id === cheatsheetId)
        const cheatsheetTitle = cheatsheet?.title || 'this cheatsheet'
        
        const confirmed = window.confirm(
            `Are you sure you want to delete "${cheatsheetTitle}"? This action cannot be undone.`
        )
        
        if (confirmed) {
            setCheatsheets(prevCheatsheets => 
                prevCheatsheets.filter(c => c.id !== cheatsheetId)
            )
        }
    }

    return (
        <div className="prev-page">
            <h3 className="prev-page-title">Your Previous Cheatsheets</h3>
            {cheatsheets.length > 0 ? (
                <div className="cheatsheets-grid">
                    {cheatsheets.map(cheatsheet => (
                        <CheatsheetCard 
                            key={cheatsheet.id} 
                            cheatsheet={cheatsheet}
                            onDelete={handleDeleteCheatsheet}
                        />
                    ))}
                </div>
            ) : (
                <div className="no-cheatsheets">
                    <h2 className="no-cheatsheets-text">No cheatsheets yet</h2>
                    <Link to="/create" className="create-cheatsheet-btn">
                        Create Cheatsheet
                    </Link>
                </div>
            )}

            {/* Shared Cheatsheets Section */}
            {sharedCheatsheets.length > 0 && (
                <>
                    <h3 className="prev-page-title shared-section-title">Shared Cheatsheets</h3>
                    <div className="cheatsheets-grid">
                        {sharedCheatsheets.map(cheatsheet => (
                            <CheatsheetCard 
                                key={cheatsheet.id} 
                                cheatsheet={cheatsheet}
                                onDelete={null}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default Cheatsheets