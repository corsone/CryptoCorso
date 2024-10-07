import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import Dapp from "./components/Dapp";

import { BrowserRouter } from "react-router-dom";

import './css/index.css';

// This is the entry point of your application, but it just renders the Dapp
// react component.
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <BrowserRouter>
      <Dapp />
    </BrowserRouter>
  </StrictMode>
);
