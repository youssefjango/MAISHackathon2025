import { Link } from 'react-router-dom'
import exampleCheatsheet from '../assets/example_cheatsheet.jpg'
import "../css/Home.css"

function Home() {
    return (
        <>
            <div className="home-container">
                <h3 className="home-welcome-message">Welcome! Improve your knowledge on courses ahead of your exams...  </h3>
                <Link to="/generate" className="home-create-link">
                    <button className="home-create-button">Create</button>
                </Link>
                <img src={exampleCheatsheet} alt="Example Cheat Sheet" className="home-example-image"/>
            </div>
        </>
    )
}

export default Home