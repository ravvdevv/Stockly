import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("%craven built this", "color: #10b981; font-weight: bold; font-size: 1.2rem;");
console.log("%chttps://github.com/ravvdevv", "color: #3b82f6; font-size: 0.8rem;");
createRoot(document.getElementById("root")!).render(<App />);
