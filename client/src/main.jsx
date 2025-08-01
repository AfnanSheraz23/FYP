import { StrictMode } from "react"
import { BrowserRouter } from "react-router-dom"
import { createRoot } from "react-dom/client"

import App from "./App.jsx"
import "./index.css"
import "./fonts.css"
import "./inputEmoji.css"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
