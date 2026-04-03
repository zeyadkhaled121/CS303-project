import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </AppErrorBoundary>
);
