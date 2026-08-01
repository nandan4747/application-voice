import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { MusicProvider } from "./MusicContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <MusicProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </MusicProvider>
  </BrowserRouter>,
);
