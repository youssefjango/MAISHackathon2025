import '../css/CheatsheetCard.css'
import placeholderImage from '../assets/cheatsheet_placeholder.png'
import { Link } from 'react-router-dom'

function CheatsheetCard({ cheatsheet, onDelete }) {
    function onCardClick() {
        // Handle viewing/downloading the cheatsheet
    }

    function onDeleteClick(e) {
        e.stopPropagation()
        e.preventDefault()
        if (onDelete && cheatsheet.id) {
            onDelete(cheatsheet.id)
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "Unknown date"
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    function handleImageError(e) {
        e.target.src = placeholderImage
    }

    return (
        <Link to={`/cheatsheet/${cheatsheet.id}`} className="cheatsheet-link">
            <div className="cheatsheet-card" onClick={onCardClick}>
                <div className="cheatsheet-preview">
                    <img 
                        src={cheatsheet.image || placeholderImage} 
                        alt={cheatsheet.title || "Cheatsheet"} 
                        className="cheatsheet-image"
                        onError={handleImageError}
                    />
                    {onDelete && (
                        <div className="cheatsheet-overlay">
                            <button 
                                className="cheatsheet-delete-btn"
                                onClick={onDeleteClick}
                            >
                                🗑️
                            </button>
                        </div>
                    )}
                    {cheatsheet.subject && (
                        <div className="cheatsheet-subject-tag">
                            {cheatsheet.subject}
                        </div>
                    )}
                </div>
                <div className="cheatsheet-info">
                    <h3 className="cheatsheet-title">{cheatsheet.title || "Untitled Cheatsheet"}</h3>
                    <p className="cheatsheet-description">
                        {cheatsheet.description || "No description available"}
                    </p>
                    <p className="cheatsheet-date">
                        {formatDate(cheatsheet.date || cheatsheet.createdAt)}
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default CheatsheetCard
