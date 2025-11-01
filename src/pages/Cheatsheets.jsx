import { useState } from 'react'
import { Link } from 'react-router-dom'
import CheatsheetCard from '../components/CheatsheetCard'
import '../css/Cheatsheets.css'

function Cheatsheets() {
    // Example data - replace with your actual cheatsheets data
    const [cheatsheets, setCheatsheets] = useState([
        {
          id: 1,
          title: "Math 101",
          subject: "Mathematics",
          description: "Core calculus formulas and algebraic identities.",
          date: "2024-01-14",
        },
        {
          id: 2,
          title: "Physics Fundamentals",
          subject: "Physics",
          description: "Motion, forces, and key equations for mechanics.",
          date: "2024-02-10",
        },
        {
          id: 3,
          title: "Organic Chemistry Reactions",
          subject: "Chemistry",
          description: "Reaction mechanisms and common organic synthesis routes.",
          date: "2024-03-05",
        },
        {
          id: 4,
          title: "Python Syntax",
          subject: "Programming",
          description: "Essential Python commands, syntax, and functions.",
          date: "2024-04-18",
        },
        {
          id: 5,
          title: "Human Anatomy Basics",
          subject: "Biology",
          description: "Overview of body systems and anatomical terminology.",
          date: "2024-05-12",
        },
        {
          id: 6,
          title: "Statistics Reference",
          subject: "Statistics",
          description: "Formulas for mean, variance, distributions, and regression.",
          date: "2024-06-22",
        },
        {
          id: 7,
          title: "Microeconomics Principles",
          subject: "Economics",
          description: "Supply and demand, elasticity, and marginal analysis.",
          date: "2024-07-30",
        },
        {
          id: 8,
          title: "Pharmacology Essentials",
          subject: "Pharmacy",
          description: "Drug classes, mechanisms of action, and key side effects.",
          date: "2024-08-15",
        },
        {
          id: 9,
          title: "Data Structures Overview",
          subject: "Computer Science",
          description: "Big-O, stacks, queues, trees, and graphs.",
          date: "2024-09-05",
        },
        {
          id: 10,
          title: "French Grammar Rules",
          subject: "Languages",
          description: "Verb conjugation, tenses, and common grammar structures.",
          date: "2024-10-12",
        },
        {
          id: 11,
          title: "Machine Learning Quickstart",
          subject: "AI & Data Science",
          description: "Model types, loss functions, and basic sklearn workflow.",
          date: "2024-10-20",
        },
        {
          id: 12,
          title: "Ethics & Law in Pharmacy",
          subject: "Pharmacy",
          description: "Canadian healthcare ethics and pharmaceutical regulation.",
          date: "2024-11-01",
        },
      ])

    // Shared cheatsheets from online (read-only)
    const sharedCheatsheets = [
        {
          id: 'shared-1',
          title: "Linear Algebra Reference",
          subject: "Mathematics",
          description: "Matrix operations, eigenvalues, and vector spaces.",
          date: "2024-01-10",
          shared: true,
        },
        {
          id: 'shared-2',
          title: "Quantum Physics Basics",
          subject: "Physics",
          description: "Wave functions, uncertainty principle, and quantum states.",
          date: "2024-02-15",
          shared: true,
        },
        {
          id: 'shared-3',
          title: "React.js Cheat Sheet",
          subject: "Programming",
          description: "Hooks, components, state management, and best practices.",
          date: "2024-03-20",
          shared: true,
        },
        {
          id: 'shared-4',
          title: "Organic Chemistry Mechanisms",
          subject: "Chemistry",
          description: "SN1, SN2, E1, E2 reactions and arrow pushing patterns.",
          date: "2024-04-05",
          shared: true,
        },
      ]

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